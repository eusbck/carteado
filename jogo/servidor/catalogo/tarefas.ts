// Importar e atualizar decks pelo link do Moxfield, em dois passos:
//   verificar  busca o deck no Moxfield e os dados das cartas desconhecidas no Scryfall, confere as regras de deck
//              e diz o que muda (nada é gravado). A prévia fica guardada 30 minutos, com um token.
//   confirmar  baixa o que falta das cartas novas (impressão em português, rulings, fichas, imagens, arte do
//              comandante), grava decks/ e regenera gerado/. Se todas as cartas da lista têm regras, ela vira a
//              lista jogável; se não, fica em preparação e o deck segue com a lista anterior.
//   importar   os dois passos numa tarefa só, para um deck novo (a tela Decks): para na prévia quando o link é de um
//              deck que já está na mesa (a atualização mostra o que entra e sai) ou quando a lista quebra uma regra.
// Várias tarefas andam juntas (um deck de cada vez em cada uma): os downloads correm ao mesmo tempo, e só a gravação de
// decks/ e gerado/ espera a vez, numa fila do processo e com a trava da linha de comando. Uma falha no meio não muda o
// arquivo do deck.

import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { oracleDeDados, type OracleCard } from '../../motor/oracle.ts';
import type { CartaCatalogo, Proposta, TarefaPublica } from '../protocolo.ts';
import { baixarArte, gravarFontes, lerFontes, temArte } from './artes.ts';
import { gravarJson, lerRulingsNovos } from './base.ts';
import type { Pastas } from './caminhos.ts';
import { Catalogo, diferenca, listasIguais, mesclarOrdem } from './catalogo.ts';
import { cartaGerada, escreverGerado, gerar, lerAnterior, lerNovas, lerOriginais, nomesDaLista, type CartasGeradas, type ImagensGeradas } from './gerar.ts';
import { baixarDeck, ErroDeck, lerLink, linkDoDeck, type DeckMox } from './moxfield.ts';
import type { Rede } from './rede.ts';
import { baixarImagens, colecao, ehFicha, escolherImpressao, impressoes, oracleIdDe, paraCarta, paraImpressao, partesFicha, porNome, rulings } from './scryfall.ts';
import type { DeckArquivo, EntradaLista, ImagemLocal, Lista, Ruling, ScryObjeto, VersaoLista } from './tipos.ts';
import { comTrava, ErroTrava } from './trava.ts';
import { lerBanidas, validarLista } from './validar.ts';

export class ErroOcupado extends Error {}

/** quanto tempo uma prévia e uma tarefa que terminou ficam guardadas */
const VALIDADE = 30 * 60_000;
/** teto de cartas diferentes numa lista (um deck de Commander tem 100; sobra para básicos) */
const TETO_CARTAS = 150;
/** importações andando juntas no servidor */
const TETO_TAREFAS = 8;
/** quanto o servidor espera a linha de comando soltar a trava antes de desistir */
const ESPERA_TRAVA = 60_000;

interface Guardada {
  proposta: Proposta;
  expira: number;
  deck: DeckMox;
  lista: Lista;
  /** carta desconhecida (pelo nome do jogo) → impressão pedida no Moxfield */
  novas: Map<string, ScryObjeto>;
}

export interface OpcoesTarefas {
  pastas: Pastas;
  rede: Rede;
  catalogo: Catalogo;
  pronta: (nome: string) => boolean;
  /** listas jogáveis ou o catálogo mudaram (o servidor troca os decks do saguão e avisa as telas) */
  aoMudar?: (listasMudaram: boolean) => void;
  /** andamento de uma tarefa (para as telas abertas) */
  aoAndamento?: (t: TarefaPublica) => void;
  /** baixar a arte do comandante (padrão: sim) */
  artes?: boolean;
  agora?: () => Date;
  /** quanto esperar a trava da linha de comando (padrão: ESPERA_TRAVA) */
  esperaTrava?: number;
}

/** o andamento de uma tarefa: cada passo muda só a dela */
interface Passo {
  etapa(etapa: string, feito?: number, total?: number, extra?: Partial<TarefaPublica>): void;
}

interface Execucao {
  t: TarefaPublica;
  ultimoAviso: number;
  /** o aviso guardado pelo limite de 250 ms (sai atrasado, para a última etapa sempre chegar à tela) */
  atrasado: ReturnType<typeof setTimeout> | null;
  /** quando terminou (0: andando) */
  fim: number;
}

/** o que uma confirmação baixou das cartas novas, antes de gravar */
interface Baixadas {
  cartas: { nome: string; oid: string; en: ScryObjeto; pt: ScryObjeto | null; imgEn: ImagemLocal[]; imgPt: ImagemLocal[]; rulings: Ruling[] }[];
  fichas: { oid: string; obj: ScryObjeto; img: ImagemLocal[] }[];
}

export class TarefasDecks {
  private o: OpcoesTarefas;
  private execucoes = new Map<number, Execucao>();
  private propostas = new Map<string, Guardada>();
  // o número segue o relógio: não repete depois de o servidor reiniciar (o cliente guarda os das tarefas dele)
  private seq = Date.now();
  /** a última gravação em decks/ e gerado/ (a próxima espera ela terminar) */
  private fila: Promise<unknown> = Promise.resolve();

  constructor(o: OpcoesTarefas) {
    this.o = o;
  }

  private agora(): Date { return this.o.agora?.() ?? new Date(); }

  /** as tarefas andando e as que terminaram há menos de VALIDADE (para a tela Decks) */
  lista(): TarefaPublica[] {
    this.limparVencidas();
    return [...this.execucoes.values()].map((e) => e.t);
  }

  tarefa(id: number): TarefaPublica | null {
    return this.execucoes.get(id)?.t ?? null;
  }

  get ocupada(): boolean { return [...this.execucoes.values()].some((e) => e.t.estado === 'andando'); }

  // ---------------------------------------------------------------- execução

  /** verifica um link e espera a prévia (linha de comando) */
  verificar(link: string): Promise<Proposta> {
    return this.executar('verificar', lerLink(link), (p) => this.fazerVerificar(link, p), (proposta) => ({ proposta }));
  }

  /** confirma uma prévia e espera o resultado (linha de comando) */
  confirmar(token: string): Promise<NonNullable<TarefaPublica['resultado']>> {
    return this.executar('confirmar', this.propostas.get(token)?.proposta.id ?? null, (p) => this.fazerConfirmar(token, p), (resultado) => ({ resultado }));
  }

  /** começa a verificar um link em segundo plano (servidor); a prévia chega por `aoAndamento` */
  iniciarVerificar(link: string): number {
    return this.comecar(lerLink(link), () => this.verificar(link));
  }

  iniciarConfirmar(token: string): number {
    return this.comecar(this.propostas.get(token)?.proposta.id ?? null, () => this.confirmar(token));
  }

  /** importa um link em segundo plano: verificar e, num deck novo que cumpre as regras, confirmar na mesma tarefa */
  iniciarImportar(link: string): number {
    const deck = lerLink(link);
    return this.comecar(deck, () => this.executar('verificar', deck, async (p) => {
      const proposta = await this.fazerVerificar(link, p);
      if (!proposta.novo || proposta.erros.length || proposta.destino === 'nada') return { proposta };
      p.etapa('Preparando', 0, 0, { tipo: 'confirmar', proposta });
      return { proposta, resultado: await this.fazerConfirmar(proposta.token, p) };
    }, (r) => r));
  }

  /** `f` cria a tarefa antes do primeiro `await` (executar), então o id já existe na volta */
  private comecar(deck: string | null, f: () => Promise<unknown>): number {
    this.conferirVaga(deck);
    void f().catch(() => { /* o erro fica na tarefa */ });
    return this.seq;
  }

  /** recusa o mesmo deck duas vezes ao mesmo tempo e mais de TETO_TAREFAS juntas */
  private conferirVaga(deck: string | null): void {
    const andando = [...this.execucoes.values()].filter((e) => e.t.estado === 'andando');
    if (deck && andando.some((e) => e.t.deck === deck)) throw new ErroOcupado('Esse deck já está sendo buscado ou importado; espere terminar');
    if (andando.length >= TETO_TAREFAS) throw new ErroOcupado(`Já há ${andando.length} importações de deck em andamento; espere uma terminar`);
  }

  private async executar<T>(tipo: TarefaPublica['tipo'], deck: string | null, f: (p: Passo) => Promise<T>, fim: (r: T) => Partial<TarefaPublica>): Promise<T> {
    this.conferirVaga(deck);
    this.limparVencidas();
    const id = ++this.seq;
    const ex: Execucao = { t: { id, tipo, deck, nome: null, etapa: 'Começando', feito: 0, total: 0, estado: 'andando' }, ultimoAviso: 0, atrasado: null, fim: 0 };
    this.execucoes.set(id, ex);
    this.avisar(ex, true);
    const passo: Passo = {
      etapa: (etapa, feito = 0, total = 0, extra = {}) => {
        ex.t = { ...ex.t, etapa, feito, total, ...extra };
        this.avisar(ex, false);
      },
    };
    try {
      const r = await f(passo);
      ex.t = { ...ex.t, ...fim(r), estado: 'pronta', etapa: 'Pronto' };
      return r;
    } catch (e) {
      ex.t = { ...ex.t, estado: 'erro', erro: mensagem(e) };
      throw e;
    } finally {
      ex.fim = Date.now();
      this.avisar(ex, true);
    }
  }

  private avisar(ex: Execucao, sempre: boolean): void {
    const agora = Date.now();
    if (!sempre && agora - ex.ultimoAviso < 250) {
      // a etapa que caiu no limite sai depois (ex.: "Esperando a vez de gravar" logo depois do último download)
      ex.atrasado ??= setTimeout(() => this.avisar(ex, true), 250 - (agora - ex.ultimoAviso));
      return;
    }
    if (ex.atrasado) { clearTimeout(ex.atrasado); ex.atrasado = null; }
    ex.ultimoAviso = agora;
    this.o.aoAndamento?.(ex.t);
  }

  /** as gravações em decks/ e gerado/ uma de cada vez, e nunca junto com a linha de comando (a trava) */
  private gravar<T>(f: () => Promise<T> | T): Promise<T> {
    const r = this.fila.then(() => comTrava(this.o.pastas.decks, async () => f(), { esperar: this.o.esperaTrava ?? ESPERA_TRAVA }));
    this.fila = r.catch(() => { /* a falha fica com quem pediu */ });
    return r;
  }

  // ---------------------------------------------------------------- passo 1: verificar

  /** busca o deck e diz o que confirmar vai fazer */
  private async fazerVerificar(entrada: string, p: Passo): Promise<Proposta> {
    this.limparVencidas();
    const id = lerLink(entrada);
    if (!id) throw new ErroDeck('Cole o link de um deck do Moxfield (https://moxfield.com/decks/...)');
    p.etapa('Buscando o deck no Moxfield', 0, 0, { deck: id });
    const { deck } = await baixarDeck(this.o.rede, id);
    if (deck.principal.length + 1 > TETO_CARTAS) throw new ErroDeck(`O deck tem ${deck.principal.length + 1} cartas diferentes; o jogo aceita até ${TETO_CARTAS}`);
    p.etapa('Conferindo as cartas', 0, 0, { deck: deck.publicId, nome: deck.nome });

    const gerado = this.lerGerado();
    const conhecida = (n: string) => !!gerado.cartas[n];

    // cartas que o jogo ainda não conhece: os dados vêm do Scryfall
    const pedidas = [...deck.comandantes, ...deck.principal];
    const desconhecidas = pedidas.filter((e) => !conhecida(e.nome));
    const novas = new Map<string, ScryObjeto>();
    const nomeDoJogo = new Map<string, string>();
    if (desconhecidas.length) {
      p.etapa(`Buscando ${desconhecidas.length} cartas novas no Scryfall`, 0, desconhecidas.length);
      const { cartas } = await colecao(this.o.rede, desconhecidas.map((e) => e.scryfallId ?? '').filter(Boolean));
      const porId = new Map(cartas.map((c) => [c.id, c]));
      let feito = 0;
      for (const e of desconhecidas) {
        let obj: ScryObjeto | null = (e.scryfallId && porId.get(e.scryfallId)) || null;
        if (!obj || (obj.name !== e.nome && !obj.name.startsWith(`${e.nome} //`))) obj = await porNome(this.o.rede, e.nome);
        if (!obj) throw new ErroDeck(`${e.nome} não foi encontrada no Scryfall`);
        if (ehFicha(obj)) throw new ErroDeck(`${e.nome} é uma ficha, não uma carta do deck`);
        nomeDoJogo.set(e.nome, obj.name);
        if (!conhecida(obj.name)) novas.set(obj.name, obj);
        p.etapa(`Buscando ${desconhecidas.length} cartas novas no Scryfall`, ++feito, desconhecidas.length);
      }
    }
    const nome = (n: string) => nomeDoJogo.get(n) ?? n;

    const existente = this.o.catalogo.ler(deck.publicId);
    const cartas = juntar(deck.principal.map((e) => ({ nome: nome(e.nome), quantidade: e.quantidade })));
    const lista: Lista = {
      comandante: nome(deck.comandantes[0].nome),
      cartas: existente?.atual ? mesclarOrdem(existente.atual.cartas, cartas) : cartas,
    };

    // regras de deck, com os dados de gerado/ (no disco) e os do Scryfall para as cartas novas
    const buscar = (n: string): OracleCard => {
      const c = gerado.cartas[n];
      if (c) return oracleDeDados(c);
      const obj = novas.get(n);
      if (!obj) throw new Error(`Carta sem dados: ${n}`);
      return oracleDeDados(cartaGerada(paraCarta(obj, [obj.id])));
    };
    const { erros, avisos } = validarLista(lista, buscar, {
      banidas: lerBanidas(this.o.pastas.dados),
      legalidade: (n) => novas.get(n)?.legalities?.commander ?? null,
    });
    if (deck.ignoradas.length) avisos.push(`Só o comandante e o deck principal entram no jogo; ficam de fora: ${deck.ignoradas.join(', ')}`);

    const faltam = nomesDaLista(lista).filter((n) => !this.o.pronta(n));
    const base = existente?.atual ?? existente?.preparacao ?? null;
    const dif = existente ? diferenca(base, lista) : { entram: [], saem: [], comandante: null };
    let destino: Proposta['destino'];
    let resumo: string;
    const n = faltam.length;
    const cartasTxt = (k: number) => (k === 1 ? '1 carta' : `${k} cartas`);
    const faltaTxt = n === 1 ? '1 carta ainda não tem regras no jogo' : `${n} cartas ainda não têm regras no jogo`;
    const prontasTxt = n === 1 ? 'até ela ficar pronta' : 'até elas ficarem prontas';
    if (erros.length) {
      destino = n === 0 ? 'jogavel' : 'preparacao';
      resumo = 'A lista não cumpre as regras de deck do Commander: corrija no Moxfield e busque de novo.';
    } else if (existente && listasIguais(existente.atual, lista)) {
      destino = existente.preparacao ? 'jogavel' : 'nada';
      resumo = existente.preparacao
        ? 'A lista no Moxfield é igual à que está na mesa: a atualização que esperava cartas será descartada.'
        : 'Nenhuma carta mudou desde a última importação.';
    } else if (existente && listasIguais(existente.preparacao, lista)) {
      destino = 'nada';
      resumo = `Essa versão já está guardada, esperando ${cartasTxt(n)} ${n === 1 ? 'ganhar' : 'ganharem'} regras.`;
    } else if (n === 0) {
      destino = 'jogavel';
      resumo = existente?.atual ? 'Todas as cartas já têm regras: a lista nova vale a partir da próxima partida.' : 'Todas as cartas já têm regras: o deck entra no saguão na hora.';
    } else {
      destino = 'preparacao';
      resumo = existente?.atual
        ? `${faltaTxt}. A atualização fica guardada e o deck segue com a lista atual ${prontasTxt}.`
        : `${faltaTxt}. O deck fica em preparação ${prontasTxt}.`;
    }

    const info = (e: EntradaLista): CartaCatalogo => {
      const obj = novas.get(e.nome);
      const pt = gerado.imagens[e.nome]?.pt?.nome ?? null;
      const img = imagemDoDisco(gerado.imagens, e.nome);
      return { nome: e.nome, quantidade: e.quantidade, pt, img, tipo: gerado.cartas[e.nome]?.faces[0]?.typeLine ?? obj?.type_line ?? '', pronta: this.o.pronta(e.nome) };
    };
    const quantidade = new Map(lista.cartas.map((c) => [c.nome, c.quantidade]));
    const token = randomBytes(12).toString('base64url');
    const proposta: Proposta = {
      token,
      id: deck.publicId,
      nome: deck.nome,
      link: linkDoDeck(deck.publicId),
      novo: !existente,
      comandante: lista.comandante,
      comandantePt: gerado.imagens[lista.comandante]?.pt?.nome ?? null,
      total: nomesDaLista(lista).length,
      prontas: nomesDaLista(lista).length - n,
      faltam: faltam.map((x) => info({ nome: x, quantidade: x === lista.comandante ? 1 : quantidade.get(x) ?? 1 })),
      entram: dif.entram.map(info),
      saem: dif.saem.map(info),
      trocaComandante: dif.comandante,
      destino,
      resumo,
      erros,
      avisos,
    };
    this.propostas.set(token, { proposta, expira: Date.now() + VALIDADE, deck, lista, novas });
    return proposta;
  }

  // ---------------------------------------------------------------- passo 2: confirmar

  private async fazerConfirmar(token: string, passo: Passo): Promise<NonNullable<TarefaPublica['resultado']>> {
    this.limparVencidas();
    const g = this.propostas.get(token);
    if (!g) throw new ErroDeck('A prévia venceu ou já foi usada; busque o deck de novo');
    this.propostas.delete(token);
    const { proposta: p, deck, lista } = g;
    if (p.erros.length) throw new ErroDeck(`O deck não cumpre as regras de Commander: ${p.erros[0]}`);
    passo.etapa('Preparando', 0, 0, { deck: p.id, nome: p.nome });

    // 1. o que falta das cartas novas, fora da fila: as importações juntas baixam ao mesmo tempo
    const baixadas: Baixadas = p.destino === 'nada' ? { cartas: [], fichas: [] } : await this.baixarNovas(g, passo);

    // 2. a gravação, na vez desta tarefa. Tudo é lido de novo do disco: outra importação pode ter gravado no meio
    passo.etapa('Esperando a vez de gravar');
    const gravado = await this.gravar(() => {
      passo.etapa('Gravando');
      const agora = this.agora().toISOString();
      const cat = this.o.catalogo;
      const existente = cat.ler(p.id);
      const tinhaLista = !!existente?.atual;
      const d: DeckArquivo = existente ?? {
        formato: 1, id: p.id, ordem: cat.proximaOrdem(), nome: p.nome, link: p.link,
        importadoEm: agora, verificadoEm: null, atual: null, preparacao: null,
      };
      d.nome = p.nome;
      d.link = p.link;
      d.verificadoEm = agora;
      if (p.destino === 'nada') {
        cat.salvar(d);
        return { tinhaLista, listas: false, imagens: null };
      }

      // cartas novas: impressão em inglês e em português, imagens, rulings e as fichas que elas criam
      const originais = lerOriginais(this.o.pastas.cartasOriginais);
      const novas = lerNovas(this.o.pastas.decks);
      const rul = lerRulingsNovos(this.o.pastas.decks);
      for (const c of baixadas.cartas) {
        // a mesma carta nova em dois decks importados juntos: fica a impressão de quem gravou primeiro (como numa
        // importação depois da outra), sem impressões soltas
        if (novas.escolhas[c.nome]) continue;
        rul.by_oracle_id[c.oid] = c.rulings;
        novas.cards[c.oid] = paraCarta(c.en, [c.en.id, ...(c.pt ? [c.pt.id] : [])]);
        novas.printings[c.en.id] = paraImpressao(c.en, c.imgEn);
        if (c.pt) novas.printings[c.pt.id] = paraImpressao(c.pt, c.imgPt);
        novas.escolhas[c.nome] = { en: c.en.id, pt: c.pt?.id ?? null };
      }
      // a mesma ficha pode ter chegado por outra importação enquanto esta baixava
      for (const f of baixadas.fichas) {
        if (originais.cards[f.oid] || novas.cards[f.oid]) continue;
        novas.cards[f.oid] = paraCarta(f.obj, [f.obj.id]);
        novas.printings[f.obj.id] = paraImpressao(f.obj, f.img);
        novas.fichas.push(f.oid);
      }

      // a lista nova
      const versao: VersaoLista = { ...lista, origem: { versao: deck.versao, atualizadoEm: deck.atualizadoEm }, desde: agora };
      if (p.destino === 'jogavel') {
        d.atual = existente?.atual && listasIguais(existente.atual, lista) ? existente.atual : versao;
        d.preparacao = null;
      } else {
        d.preparacao = versao;
      }

      gravarJson(join(this.o.pastas.decks, 'cartas.json'), novas);
      gravarJson(join(this.o.pastas.decks, 'rulings.json'), rul);
      cat.salvar(d);
      const saida = gerar({ originais, novas, decks: cat.todos(), anterior: lerAnterior(this.o.pastas.gerado) });
      escreverGerado(this.o.pastas.gerado, saida);
      return { tinhaLista, listas: p.destino === 'jogavel', imagens: saida.imagens };
    });

    // 3. arte do comandante em alta qualidade (sem ela, o servidor recorta a imagem da carta)
    if (this.o.artes !== false && gravado.imagens) {
      passo.etapa('Baixando a arte do comandante');
      try {
        await this.garantirArte(lista.comandante, gravado.imagens);
      } catch (e) {
        console.error(`arte de ${lista.comandante}:`, e);
      }
    }

    const n = p.total - p.prontas;
    const cartasTxt = n === 1 ? '1 carta' : `${n} cartas`;
    const texto = p.destino === 'nada'
      ? p.resumo
      : p.destino === 'jogavel'
        ? (gravado.tinhaLista ? `${p.nome} foi atualizado.` : `${p.nome} entrou no saguão.`)
        : gravado.tinhaLista
          ? `A atualização de ${p.nome} ficou guardada: faltam regras para ${cartasTxt}. O deck segue com a lista anterior.`
          : `${p.nome} ficou em preparação: faltam regras para ${cartasTxt}.`;
    this.o.aoMudar?.(gravado.listas);
    return { id: p.id, destino: p.destino, texto };
  }

  /** baixa o que falta das cartas novas da prévia (impressões, imagens, rulings e fichas), sem gravar decks/ */
  private async baixarNovas(g: Guardada, passo: Passo): Promise<Baixadas> {
    // uma carta que outra importação já gravou depois desta prévia não é baixada de novo
    const ja = lerNovas(this.o.pastas.decks);
    const originais = lerOriginais(this.o.pastas.cartasOriginais);
    const conhecidas = new Set([...Object.keys(originais.cards), ...Object.keys(ja.cards)]);
    const fichas = new Set<string>();
    const out: Baixadas = { cartas: [], fichas: [] };
    const lista = [...g.novas.entries()].filter(([nome]) => !ja.escolhas[nome]);
    let feito = 0;
    for (const [nome, obj] of lista) {
      passo.etapa(`Baixando as cartas novas: ${nome}`, feito, lista.length);
      const oid = oracleIdDe(obj);
      const en = obj.lang === 'en' ? obj : (escolherImpressao(await impressoes(this.o.rede, oid, 'en'), obj) ?? obj);
      const pt = escolherImpressao(await impressoes(this.o.rede, oid, 'pt'), en);
      const imgEn = await baixarImagens(this.o.rede, en, this.o.pastas.imagens);
      const imgPt = pt && pt.image_status !== 'placeholder' ? await baixarImagens(this.o.rede, pt, this.o.pastas.imagens) : [];
      const regras = await rulings(this.o.rede, en.id);
      for (const f of partesFicha(en)) fichas.add(f);
      out.cartas.push({ nome, oid, en, pt, imgEn, imgPt, rulings: regras });
      conhecidas.add(oid);
      feito++;
    }
    // fichas criadas pelas cartas novas que o jogo ainda não tem
    if (fichas.size) {
      passo.etapa('Baixando as fichas', 0, fichas.size);
      const { cartas } = await colecao(this.o.rede, [...fichas]);
      let k = 0;
      for (const f of cartas) {
        const oid = oracleIdDe(f);
        if (!oid || conhecidas.has(oid)) continue;
        out.fichas.push({ oid, obj: f, img: await baixarImagens(this.o.rede, f, this.o.pastas.imagens) });
        conhecidas.add(oid);
        passo.etapa('Baixando as fichas', ++k, fichas.size);
      }
    }
    return out;
  }

  private async garantirArte(comandante: string, imagens: ImagensGeradas): Promise<void> {
    const local = imagemDoDisco(imagens, comandante);
    if (!local) return;
    if (temArte(this.o.pastas.artes, comandante, local)) return;
    const registro = await baixarArte({ rede: this.o.rede, nome: comandante, idLocal: local, pastaArtes: this.o.pastas.artes });
    // fontes.json é de todos os decks: lido de novo na vez de gravar
    await this.gravar(() => {
      const registros = lerFontes(this.o.pastas.artes);
      registros[comandante] = registro;
      gravarFontes(this.o.pastas.artes, registros);
    });
  }

  private lerGerado(): { cartas: CartasGeradas['cartas']; imagens: ImagensGeradas } {
    const a = lerAnterior(this.o.pastas.gerado);
    return { cartas: a.cartas?.cartas ?? {}, imagens: a.imagens ?? {} };
  }

  private limparVencidas(): void {
    const agora = Date.now();
    for (const [t, g] of this.propostas) if (g.expira < agora) this.propostas.delete(t);
    for (const [id, e] of this.execucoes) if (e.fim && e.fim + VALIDADE < agora) this.execucoes.delete(id);
  }
}

/** a imagem que o jogo mostra da carta: a portuguesa, se houver e não for de reserva; se não, a inglesa */
function imagemDoDisco(imagens: ImagensGeradas, nome: string): string | null {
  const i = imagens[nome];
  return ((i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null)?.id ?? null;
}

/** a mesma carta em mais de uma linha vira uma linha só */
function juntar(l: EntradaLista[]): EntradaLista[] {
  const m = new Map<string, number>();
  for (const e of l) m.set(e.nome, (m.get(e.nome) ?? 0) + e.quantidade);
  return [...m].map(([nome, quantidade]) => ({ nome, quantidade }));
}

export function mensagem(e: unknown): string {
  if (e instanceof ErroDeck || e instanceof ErroOcupado) return e.message;
  if (e instanceof ErroTrava) return e.message;
  console.error('importação de deck:', e);
  return e instanceof Error ? `Erro na importação: ${e.message}` : 'Erro na importação';
}
