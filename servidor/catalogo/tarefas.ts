// Importar e atualizar decks pelo link do Moxfield, em dois passos:
//   verificar  busca o deck no Moxfield e os dados das cartas desconhecidas no Scryfall, confere as regras de deck
//              e diz o que muda (nada é gravado). A prévia fica guardada 30 minutos, com um token.
//   confirmar  baixa o que falta das cartas novas (impressão em português, rulings, fichas, imagens, arte do
//              comandante), grava decks/ e regenera gerado/. Se todas as cartas da lista têm regras, ela vira a
//              lista jogável; se não, fica em preparação e o deck segue com a lista anterior.
// Uma tarefa por vez para a mesa toda. Uma falha no meio não muda o arquivo do deck.

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
import type { DeckArquivo, EntradaLista, Lista, ScryObjeto, VersaoLista } from './tipos.ts';
import { comTrava, ErroTrava } from './trava.ts';
import { lerBanidas, validarLista } from './validar.ts';

export class ErroOcupado extends Error {}

const VALIDADE = 30 * 60_000;
/** teto de cartas diferentes numa lista (um deck de Commander tem 100; sobra para básicos) */
const TETO_CARTAS = 150;

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
  /** andamento da tarefa (para as telas abertas) */
  aoAndamento?: (t: TarefaPublica | null) => void;
  /** baixar a arte do comandante (padrão: sim) */
  artes?: boolean;
  agora?: () => Date;
}

export class TarefasDecks {
  tarefa: TarefaPublica | null = null;
  private o: OpcoesTarefas;
  private propostas = new Map<string, Guardada>();
  private seq = 0;
  private ultimoAviso = 0;

  constructor(o: OpcoesTarefas) {
    this.o = o;
  }

  private agora(): Date { return this.o.agora?.() ?? new Date(); }

  get ocupada(): boolean { return this.tarefa?.estado === 'andando'; }

  // ---------------------------------------------------------------- execução

  /** verifica um link e espera a prévia (linha de comando) */
  verificar(link: string): Promise<Proposta> {
    return this.executar('verificar', () => this.fazerVerificar(link), (proposta) => ({ proposta }));
  }

  /** confirma uma prévia e espera o resultado (linha de comando) */
  confirmar(token: string): Promise<NonNullable<TarefaPublica['resultado']>> {
    return this.executar('confirmar', () => this.fazerConfirmar(token), (resultado) => ({ resultado }));
  }

  /** começa a verificar um link em segundo plano (servidor); a prévia chega por `aoAndamento` */
  iniciarVerificar(link: string): number {
    return this.comecar(() => this.verificar(link));
  }

  iniciarConfirmar(token: string): number {
    return this.comecar(() => this.confirmar(token));
  }

  /** `f` cria a tarefa antes do primeiro `await` (executar), então o id já existe na volta */
  private comecar(f: () => Promise<unknown>): number {
    if (this.ocupada) throw new ErroOcupado('Já há uma importação de deck em andamento; espere ela terminar');
    void f().catch(() => { /* o erro fica na tarefa */ });
    return this.tarefa!.id;
  }

  private async executar<T>(tipo: TarefaPublica['tipo'], f: () => Promise<T>, fim: (r: T) => Partial<TarefaPublica>): Promise<T> {
    if (this.ocupada) throw new ErroOcupado('Já há uma importação de deck em andamento; espere ela terminar');
    const id = ++this.seq;
    this.tarefa = { id, tipo, deck: null, nome: null, etapa: 'Começando', feito: 0, total: 0, estado: 'andando' };
    this.avisar(true);
    try {
      const r = await f();
      if (this.tarefa?.id === id) {
        this.tarefa = { ...this.tarefa, ...fim(r), estado: 'pronta', etapa: 'Pronto' };
        this.avisar(true);
      }
      return r;
    } catch (e) {
      if (this.tarefa?.id === id) {
        this.tarefa = { ...this.tarefa, estado: 'erro', erro: mensagem(e) };
        this.avisar(true);
      }
      throw e;
    }
  }

  private etapa(etapa: string, feito = 0, total = 0, extra: Partial<TarefaPublica> = {}): void {
    if (!this.tarefa) return;
    this.tarefa = { ...this.tarefa, etapa, feito, total, ...extra };
    this.avisar(false);
  }

  private avisar(sempre: boolean): void {
    const agora = Date.now();
    if (!sempre && agora - this.ultimoAviso < 250) return;
    this.ultimoAviso = agora;
    this.o.aoAndamento?.(this.tarefa);
  }

  // ---------------------------------------------------------------- passo 1: verificar

  /** busca o deck e diz o que confirmar vai fazer */
  private async fazerVerificar(entrada: string): Promise<Proposta> {
    this.limparVencidas();
    const id = lerLink(entrada);
    if (!id) throw new ErroDeck('Cole o link de um deck do Moxfield (https://moxfield.com/decks/...)');
    this.etapa('Buscando o deck no Moxfield', 0, 0, { deck: id });
    const { deck } = await baixarDeck(this.o.rede, id);
    if (deck.principal.length + 1 > TETO_CARTAS) throw new ErroDeck(`O deck tem ${deck.principal.length + 1} cartas diferentes; o jogo aceita até ${TETO_CARTAS}`);
    this.etapa('Conferindo as cartas', 0, 0, { deck: deck.publicId, nome: deck.nome });

    const gerado = this.lerGerado();
    const conhecida = (n: string) => !!gerado.cartas[n];

    // cartas que o jogo ainda não conhece: os dados vêm do Scryfall
    const pedidas = [...deck.comandantes, ...deck.principal];
    const desconhecidas = pedidas.filter((e) => !conhecida(e.nome));
    const novas = new Map<string, ScryObjeto>();
    const nomeDoJogo = new Map<string, string>();
    if (desconhecidas.length) {
      this.etapa(`Buscando ${desconhecidas.length} cartas novas no Scryfall`, 0, desconhecidas.length);
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
        this.etapa(`Buscando ${desconhecidas.length} cartas novas no Scryfall`, ++feito, desconhecidas.length);
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

  private async fazerConfirmar(token: string): Promise<NonNullable<TarefaPublica['resultado']>> {
    this.limparVencidas();
    const g = this.propostas.get(token);
    if (!g) throw new ErroDeck('A prévia venceu ou já foi usada; busque o deck de novo');
    this.propostas.delete(token);
    const { proposta: p, deck, lista } = g;
    if (p.erros.length) throw new ErroDeck(`O deck não cumpre as regras de Commander: ${p.erros[0]}`);
    this.etapa('Preparando', 0, 0, { deck: p.id, nome: p.nome });

    const resultado = await comTrava(this.o.pastas.decks, async () => {
      const agora = this.agora().toISOString();
      const cat = this.o.catalogo;
      const existente = cat.ler(p.id);
      const d: DeckArquivo = existente ?? {
        formato: 1, id: p.id, ordem: cat.proximaOrdem(), nome: p.nome, link: p.link,
        importadoEm: agora, verificadoEm: null, atual: null, preparacao: null,
      };
      d.nome = p.nome;
      d.link = p.link;
      d.verificadoEm = agora;
      if (p.destino === 'nada') {
        cat.salvar(d);
        return { id: p.id, destino: p.destino, texto: p.resumo, listas: false };
      }

      // cartas novas: impressão em inglês e em português, imagens, rulings e as fichas que elas criam
      const originais = lerOriginais(this.o.pastas.cartasOriginais);
      const novas = lerNovas(this.o.pastas.decks);
      const rul = lerRulingsNovos(this.o.pastas.decks);
      const conhecidas = new Set([...Object.keys(originais.cards), ...Object.keys(novas.cards)]);
      const fichas = new Set<string>();
      const lista1 = [...g.novas.entries()];
      let feito = 0;
      for (const [nome, obj] of lista1) {
        this.etapa(`Baixando as cartas novas: ${nome}`, feito, lista1.length);
        const oid = oracleIdDe(obj);
        const en = obj.lang === 'en' ? obj : (escolherImpressao(await impressoes(this.o.rede, oid, 'en'), obj) ?? obj);
        const pt = escolherImpressao(await impressoes(this.o.rede, oid, 'pt'), en);
        const imgEn = await baixarImagens(this.o.rede, en, this.o.pastas.imagens);
        const imgPt = pt && pt.image_status !== 'placeholder' ? await baixarImagens(this.o.rede, pt, this.o.pastas.imagens) : [];
        rul.by_oracle_id[oid] = await rulings(this.o.rede, en.id);
        for (const f of partesFicha(en)) fichas.add(f);
        novas.cards[oid] = paraCarta(en, [en.id, ...(pt ? [pt.id] : [])]);
        novas.printings[en.id] = paraImpressao(en, imgEn);
        if (pt) novas.printings[pt.id] = paraImpressao(pt, imgPt);
        novas.escolhas[nome] = { en: en.id, pt: pt?.id ?? null };
        conhecidas.add(oid);
        feito++;
      }
      // fichas criadas pelas cartas novas que o jogo ainda não tem
      if (fichas.size) {
        this.etapa('Baixando as fichas', 0, fichas.size);
        const { cartas } = await colecao(this.o.rede, [...fichas]);
        let k = 0;
        for (const f of cartas) {
          const oid = oracleIdDe(f);
          if (!oid || conhecidas.has(oid)) continue;
          const img = await baixarImagens(this.o.rede, f, this.o.pastas.imagens);
          novas.cards[oid] = paraCarta(f, [f.id]);
          novas.printings[f.id] = paraImpressao(f, img);
          novas.fichas.push(oid);
          conhecidas.add(oid);
          this.etapa('Baixando as fichas', ++k, fichas.size);
        }
      }

      // a lista nova
      const versao: VersaoLista = { ...lista, origem: { versao: deck.versao, atualizadoEm: deck.atualizadoEm }, desde: agora };
      if (p.destino === 'jogavel') {
        d.atual = existente?.atual && listasIguais(existente.atual, lista) ? existente.atual : versao;
        d.preparacao = null;
      } else {
        d.preparacao = versao;
      }

      this.etapa('Gravando');
      gravarJson(join(this.o.pastas.decks, 'cartas.json'), novas);
      gravarJson(join(this.o.pastas.decks, 'rulings.json'), rul);
      cat.salvar(d);
      const saida = gerar({ originais, novas, decks: cat.todos(), anterior: lerAnterior(this.o.pastas.gerado) });
      escreverGerado(this.o.pastas.gerado, saida);

      // arte do comandante em alta qualidade (sem ela, o servidor recorta a imagem da carta)
      if (this.o.artes !== false) {
        this.etapa('Baixando a arte do comandante');
        try {
          await this.garantirArte(lista.comandante, saida.imagens);
        } catch (e) {
          console.error(`arte de ${lista.comandante}:`, e);
        }
      }

      const n = p.total - p.prontas;
      const cartasTxt = n === 1 ? '1 carta' : `${n} cartas`;
      const texto = p.destino === 'jogavel'
        ? (existente?.atual ? `${p.nome} foi atualizado.` : `${p.nome} entrou no saguão.`)
        : existente?.atual
          ? `A atualização de ${p.nome} ficou guardada: faltam regras para ${cartasTxt}. O deck segue com a lista anterior.`
          : `${p.nome} ficou em preparação: faltam regras para ${cartasTxt}.`;
      return { id: p.id, destino: p.destino, texto, listas: p.destino === 'jogavel' };
    });

    const { listas, ...r } = resultado;
    this.o.aoMudar?.(listas);
    return r;
  }

  private async garantirArte(comandante: string, imagens: ImagensGeradas): Promise<void> {
    const local = imagemDoDisco(imagens, comandante);
    if (!local) return;
    const registros = lerFontes(this.o.pastas.artes);
    if (temArte(this.o.pastas.artes, comandante, local, registros)) return;
    registros[comandante] = await baixarArte({ rede: this.o.rede, nome: comandante, idLocal: local, pastaArtes: this.o.pastas.artes });
    gravarFontes(this.o.pastas.artes, registros);
  }

  private lerGerado(): { cartas: CartasGeradas['cartas']; imagens: ImagensGeradas } {
    const a = lerAnterior(this.o.pastas.gerado);
    return { cartas: a.cartas?.cartas ?? {}, imagens: a.imagens ?? {} };
  }

  private limparVencidas(): void {
    const agora = Date.now();
    for (const [t, g] of this.propostas) if (g.expira < agora) this.propostas.delete(t);
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
