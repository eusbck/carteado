// Os decks da mesa (pasta decks/): leitura e gravação dos arquivos, quais listas são jogáveis, diferença entre
// duas versões e o resumo que a tela Decks mostra.
//
// Um deck só entra no saguão quando todas as cartas da lista têm regras (definição em cartas/defs). A versão que
// ainda espera cartas fica em `preparacao`; quando as cartas ficam prontas (o servidor sobe de novo com elas),
// `aplicarPreparacoesProntas` a troca pela atual.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DeckList } from '../../motor/state.ts';
import type { CartaCatalogo, DeckCatalogo, ListaDeck } from '../protocolo.ts';
import { nomesDaLista, type CartasGeradas, type ImagensGeradas } from './gerar.ts';
import type { DeckArquivo, EntradaLista, Lista, VersaoLista } from './tipos.ts';

const ARQUIVO = /^([A-Za-z0-9_-]{8,40})\.json$/;

export interface Diferenca {
  entram: EntradaLista[];
  saem: EntradaLista[];
  comandante: { de: string; para: string } | null;
}

function contagem(l: Lista): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of l.cartas) m.set(c.nome, (m.get(c.nome) ?? 0) + c.quantidade);
  return m;
}

/** o que entra e o que sai de `antiga` para `nova` (por nome e quantidade; o comandante à parte) */
export function diferenca(antiga: Lista | null, nova: Lista): Diferenca {
  const a = antiga ? contagem(antiga) : new Map<string, number>();
  const b = contagem(nova);
  const entram: EntradaLista[] = [];
  const saem: EntradaLista[] = [];
  for (const [nome, q] of b) { const d = q - (a.get(nome) ?? 0); if (d > 0) entram.push({ nome, quantidade: d }); }
  for (const [nome, q] of a) { const d = q - (b.get(nome) ?? 0); if (d > 0) saem.push({ nome, quantidade: d }); }
  const ordem = (x: EntradaLista, y: EntradaLista) => x.nome.localeCompare(y.nome);
  return {
    entram: entram.sort(ordem),
    saem: saem.sort(ordem),
    comandante: antiga && antiga.comandante !== nova.comandante ? { de: antiga.comandante, para: nova.comandante } : null,
  };
}

export function listasIguais(a: Lista | null, b: Lista | null): boolean {
  if (!a || !b) return a === b;
  const d = diferenca(a, b);
  return !d.comandante && !d.entram.length && !d.saem.length;
}

/**
 * Ordem das cartas da versão nova: as que ficam mantêm a posição da antiga e as que entram vão para o fim (na
 * ordem em que vieram). A ordem da lista muda o embaralhamento com semente, então trocar uma carta não mexe no
 * resto.
 */
export function mesclarOrdem(antiga: EntradaLista[] | null, nova: EntradaLista[]): EntradaLista[] {
  const q = new Map<string, number>();
  for (const c of nova) q.set(c.nome, (q.get(c.nome) ?? 0) + c.quantidade);
  const out: EntradaLista[] = [];
  for (const c of antiga ?? []) {
    const n = q.get(c.nome);
    if (n === undefined) continue;
    out.push({ nome: c.nome, quantidade: n });
    q.delete(c.nome);
  }
  for (const c of nova) {
    const n = q.get(c.nome);
    if (n === undefined) continue;
    out.push({ nome: c.nome, quantidade: n });
    q.delete(c.nome);
  }
  return out;
}

export class Catalogo {
  readonly pasta: string;
  private pronta: (nome: string) => boolean;

  constructor(o: { pasta: string; pronta: (nome: string) => boolean }) {
    this.pasta = o.pasta;
    this.pronta = o.pronta;
  }

  /** todos os decks, na ordem fixa (lidos do disco a cada chamada) */
  todos(): DeckArquivo[] {
    if (!existsSync(this.pasta)) return [];
    const out: DeckArquivo[] = [];
    for (const f of readdirSync(this.pasta)) {
      const m = f.match(ARQUIVO);
      if (!m) continue;
      try {
        const d = JSON.parse(readFileSync(join(this.pasta, f), 'utf8')) as DeckArquivo;
        if (d.formato === 1 && d.id === m[1]) out.push(d);
      } catch (e) {
        console.error(`decks/${f}:`, e);
      }
    }
    return out.sort((a, b) => a.ordem - b.ordem || a.id.localeCompare(b.id));
  }

  ler(id: string): DeckArquivo | null {
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(id)) return null;
    const arq = join(this.pasta, `${id}.json`);
    if (!existsSync(arq)) return null;
    const d = JSON.parse(readFileSync(arq, 'utf8')) as DeckArquivo;
    return d.formato === 1 && d.id === id ? d : null;
  }

  /** grava num arquivo temporário e troca (quem lê nunca vê o arquivo pela metade) */
  salvar(d: DeckArquivo): void {
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(d.id)) throw new Error(`id de deck inválido: ${d.id}`);
    mkdirSync(this.pasta, { recursive: true });
    const arq = join(this.pasta, `${d.id}.json`);
    writeFileSync(arq + '.novo', JSON.stringify(d, null, 1) + '\n');
    renameSync(arq + '.novo', arq);
  }

  proximaOrdem(): number {
    return this.todos().reduce((m, d) => Math.max(m, d.ordem + 1), 0);
  }

  /** cartas da lista que ainda não têm regras */
  faltam(l: Lista): string[] {
    return nomesDaLista(l).filter((n) => !this.pronta(n));
  }

  /** decks que podem ser escolhidos no saguão: a lista atual, com todas as cartas prontas */
  listasJogaveis(): DeckList[] {
    return this.todos()
      .filter((d) => d.atual && this.faltam(d.atual).length === 0)
      .map((d) => ({ id: d.id, nome: d.nome, comandante: d.atual!.comandante, cartas: d.atual!.cartas.map((c) => ({ ...c })) }));
  }

  /** versões em preparação cujas cartas ficaram todas prontas viram a lista atual; devolve os ids trocados */
  aplicarPreparacoesProntas(): string[] {
    const trocados: string[] = [];
    for (const d of this.todos()) {
      if (!d.preparacao || this.faltam(d.preparacao).length) continue;
      d.atual = d.preparacao;
      d.preparacao = null;
      this.salvar(d);
      trocados.push(d.id);
    }
    return trocados;
  }

  /** a lista atual de um deck, para a prévia no saguão (null: deck desconhecido ou só com versão em preparação) */
  lista(id: string, info: InfoDisco): ListaDeck | null {
    const d = this.ler(id);
    const l = d?.atual;
    if (!d || !l) return null;
    const carta = (e: EntradaLista): CartaCatalogo => {
      const i = info.carta(e.nome);
      return { nome: e.nome, quantidade: e.quantidade, pt: i?.pt ?? null, img: i?.img ?? null, tipo: i?.tipo ?? '', pronta: this.pronta(e.nome) };
    };
    return { id: d.id, nome: d.nome, comandante: carta({ nome: l.comandante, quantidade: 1 }), cartas: l.cartas.filter((c) => c.nome !== l.comandante).map(carta) };
  }

  /** resumo de cada deck para a tela Decks */
  publico(info: InfoDisco): DeckCatalogo[] {
    const carta = (e: EntradaLista): CartaCatalogo => {
      const i = info.carta(e.nome);
      return { nome: e.nome, quantidade: e.quantidade, pt: i?.pt ?? null, img: i?.img ?? null, tipo: i?.tipo ?? '', pronta: this.pronta(e.nome) };
    };
    const faltamDe = (l: VersaoLista) => {
      const q = contagem(l);
      return this.faltam(l).map((n) => carta({ nome: n, quantidade: n === l.comandante ? 1 : q.get(n) ?? 1 }));
    };
    return this.todos().map((d) => {
      const base = d.atual ?? d.preparacao!;
      const cmd = info.carta(base.comandante);
      const jogavel = !!d.atual && this.faltam(d.atual).length === 0;
      const prep = d.preparacao;
      const dif = prep ? diferenca(d.atual, prep) : null;
      return {
        id: d.id,
        nome: d.nome,
        link: d.link,
        comandante: base.comandante,
        comandantePt: cmd?.pt ?? null,
        cores: cmd?.cores ?? [],
        arte: cmd?.img ?? null,
        estado: jogavel ? (prep ? 'atualizacao' : 'pronto') : 'preparacao',
        importadoEm: d.importadoEm,
        verificadoEm: d.verificadoEm,
        atualizadoEm: (prep ?? d.atual)?.origem.atualizadoEm ?? null,
        total: nomesDaLista(base).length,
        preparacao: prep && dif ? {
          prontas: nomesDaLista(prep).length - this.faltam(prep).length,
          total: nomesDaLista(prep).length,
          faltam: faltamDe(prep),
          entram: dif.entram.map(carta),
          saem: dif.saem.map(carta),
          comandante: dif.comandante,
          recebidaEm: prep.desde,
        } : null,
      };
    });
  }
}

// ---------------------------------------------------------------------------- dados das cartas no disco

export interface InfoCartaDisco { pt: string | null; img: string | null; tipo: string; cores: string[] }
export interface InfoDisco { carta(nome: string): InfoCartaDisco | null }

/**
 * Nome em português, imagem e tipo de cada carta, lidos de gerado/ (as cartas importadas depois que o servidor
 * subiu só existem no disco). Relê quando os arquivos mudam.
 */
export function infoDoDisco(pastaGerado: string): InfoDisco {
  let marca = '';
  let cartas: CartasGeradas['cartas'] = {};
  let imagens: ImagensGeradas = {};
  const recarregar = () => {
    const a = join(pastaGerado, 'cartas.json');
    const b = join(pastaGerado, 'imagens.json');
    if (!existsSync(a) || !existsSync(b)) return;
    const m = `${statSync(a).mtimeMs}:${statSync(b).mtimeMs}`;
    if (m === marca) return;
    cartas = (JSON.parse(readFileSync(a, 'utf8')) as CartasGeradas).cartas;
    imagens = JSON.parse(readFileSync(b, 'utf8')) as ImagensGeradas;
    marca = m;
  };
  return {
    carta(nome: string) {
      recarregar();
      const c = cartas[nome];
      const i = imagens[nome];
      if (!c && !i) return null;
      const escolhida = (i?.pt && !i.pt.reserva ? i.pt : i?.en) ?? null;
      return { pt: i?.pt?.nome ?? null, img: escolhida?.id ?? null, tipo: c?.faces[0]?.typeLine ?? '', cores: c?.colorIdentity ?? [] };
    },
  };
}
