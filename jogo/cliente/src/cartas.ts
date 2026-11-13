// Imagens e textos das cartas (vindos do servidor uma vez, depois da autenticação).

import type { LogLinhaView, LogRefView } from '../../motor/view.ts';
import type { InfoCarta } from '../../servidor/protocolo.ts';

let INFO: Record<string, InfoCarta> = {};

export async function carregarCartas(): Promise<void> {
  // uma resposta de erro (sessão expirada…) não vira o catálogo das cartas
  const r = await fetch('/api/cartas');
  if (!r.ok) throw new Error(`cartas: ${r.status}`);
  INFO = await r.json();
  RE = null;
  RE_NOMES = null;
  prepararNomes();
}

/** todas as cartas que o jogo conhece: o nome do motor (inglês) e o da impressão em português, se houver */
export function todasAsCartas(): { def: string; pt: string | null }[] {
  return Object.entries(INFO).map(([def, i]) => ({ def, pt: i.pt }));
}

export function info(def: string): InfoCarta | undefined {
  return INFO[def];
}

export type Tam = 'p' | 'm' | 'g';

/** URL da imagem da carta; null se não houver imagem (ficha sem arte, carta oculta) */
export function urlImagem(def: string, face = 0, tam: Tam = 'p'): string | null {
  const i = INFO[def];
  if (!i?.f) return null;
  if (face === 1 && i.v) return `/img/${i.v}/verso/${tam}`;
  return `/img/${i.f}/frente/${tam}`;
}

/** arte recortada da carta (miniatura do deck no saguão); null se não houver imagem */
export function urlArte(def: string): string | null {
  const i = INFO[def];
  return i?.f ? `/img/${i.f}/arte` : null;
}

/** o servidor manda as imagens com cache imutável: mudar a fonte dos fundos pede um número novo aqui */
const VERSAO_FUNDO = 7;

/** fundo da área do jogador: o feito para o deck (gerado/fundos) ou a arte do comandante ampliada */
export function urlFundo(def: string): string | null {
  const i = INFO[def];
  return i?.f ? `/img/${i.f}/fundo?v=${VERSAO_FUNDO}` : null;
}

/**
 * Onde está o rosto do comandante em cada fundo feito para o deck (gerado/fundos/fontes.json), de 0 a 1 a partir da
 * esquerda e do alto, marcado à mão sobre uma grade. A tela VS põe esse ponto no meio da faixa de cada jogador.
 * Trocando a imagem de um fundo, marque o rosto de novo aqui.
 */
const ROSTO_NO_FUNDO: Record<string, readonly [number, number]> = {
  'Lula, o Espanca Pobre': [0.5, 0.21],
  'Bolsonaro, o Genocida': [0.49, 0.21],
  'Felothar the Steadfast': [0.37, 0.24],
  'Auntie Ool, Cursewretch': [0.36, 0.26],
  'Quintorius, History Chaser': [0.49, 0.25],
  'Jace, Multiverse Architect': [0.48, 0.21],
  'Rootha, Mastering the Moment': [0.43, 0.3],
  'Killian, Decisive Mentor': [0.67, 0.19],
  'Terra, Herald of Hope': [0.57, 0.19],
  'Dina, Essence Brewer': [0.49, 0.26],
  'Ghoulcaller Gisa': [0.43, 0.17],
  'Jin Sakai, Ghost of Tsushima': [0.5, 0.25],
  'Sauron, Lord of the Rings': [0.48, 0.34],
  'Doctor Doom, King of Latveria': [0.5, 0.2],
  "T'Challa, the Black Panther": [0.52, 0.37],
  'Leonardo, the Balance': [0.5, 0.3],
  "Trostani, Selesnya's Voice": [0.46, 0.26],
  'Invisible Woman': [0.39, 0.22],
  'Lathliss, Dragon Queen': [0.5, 0.15],
  'Rin and Seri, Inseparable // Rin and Seri, Inseparable': [0.54, 0.36],
  'Rin and Seri, Inseparable': [0.54, 0.36],
  'Anhelo, the Painter': [0.51, 0.22],
  'Szarekh, the Silent King': [0.5, 0.27],
  'Strefan, Maurer Progenitor': [0.53, 0.15],
  'Captain America, Team Leader': [0.48, 0.34],
  'Sai, Master Thopterist': [0.51, 0.25],
  'Yennett, Cryptic Sovereign': [0.6, 0.34],
  'Kaalia of the Vast': [0.5, 0.27],
  'The Tenth Doctor': [0.53, 0.27],
  'Rose Tyler': [0.53, 0.27],
  'Frodo, Adventurous Hobbit': [0.49, 0.29],
  'Sam, Loyal Attendant': [0.49, 0.29],
  // banners feitos pelo Codex em 12/11/2026
  'Nelly Borca, Impulsive Accuser': [0.51, 0.17],
  'Hazel of the Rootbloom': [0.55, 0.26],
  'Kotori, Pilot Prodigy': [0.42, 0.28],
  'Giada, Font of Hope': [0.45, 0.13],
  'Ghalta, Primal Hunger': [0.57, 0.13],
  'Gonti, Canny Acquisitor': [0.48, 0.28],
  'Stella Lee, Wild Card': [0.54, 0.28],
  'Aminatou, Veil Piercer': [0.49, 0.19],
  'Cloud, Ex-SOLDIER': [0.24, 0.21],
  'The Borg Queen': [0.51, 0.17],
  'Commander Spock': [0.39, 0.34],
  'Orvar, the All-Form': [0.49, 0.26],
  'The Ur-Dragon': [0.53, 0.28],
  'Inalla, Archmage Ritualist': [0.41, 0.23],
};
/** o rosto do comandante no fundo; sem marca (a arte da carta ampliada), o meio, um pouco acima */
export const rostoNoFundo = (def: string): readonly [number, number] => ROSTO_NO_FUNDO[def] ?? [0.5, 0.3];

/** nome para mostrar: a impressão em português quando houver */
export function nomeCarta(def: string, nome: string): string {
  return INFO[def]?.pt ?? nome;
}

/** "{2}{U/R}" → ["2", "U-R"] (códigos dos arquivos de símbolo) */
export function simbolos(custo: string): string[] {
  return [...custo.matchAll(/\{([^}]+)\}/g)].map((m) => m[1].replace(/\//g, '-'));
}

/** fichas conhecidas (para o ajuste manual "criar ficha") */
export function fichas(): { id: string; nome: string }[] {
  return Object.entries(INFO).filter(([, i]) => i.ficha).map(([id, i]) => ({ id, nome: i.nome ?? id })).sort((a, b) => a.nome.localeCompare(b.nome));
}

// nomes em inglês → nome impresso em português, para textos que vêm do motor ("Jogar Forest")
let RE: RegExp | null = null;
let MAPA = new Map<string, string>();
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function traduzir(texto: string): string {
  if (!RE) {
    const pares = Object.entries(INFO).filter(([n, i]) => i.pt && !i.ficha && i.pt !== n).map(([n, i]) => [n, i.pt!] as const);
    MAPA = new Map(pares);
    const nomes = pares.map(([n]) => n).sort((a, b) => b.length - a.length).map(escapar);
    RE = nomes.length ? new RegExp(String.raw`(?<![\p{L}\p{N}])(` + nomes.join('|') + String.raw`)(?![\p{L}\p{N}])`, 'gu') : /$^/;
  }
  return texto.replace(RE, (m) => MAPA.get(m) ?? m);
}

/** nome de uma ref para mostrar: a carta pelo nome impresso em português (pela def), o jogador pelo nome dele */
export function nomeDaRef(r: LogRefView, jogadores: readonly { name: string }[]): string {
  if (r.k === 'jogador') return jogadores[r.id]?.name ?? '?';
  // o nome da ref é o de `nameOf` (pode ser a outra face, ou a cópia): pela def só quando é o próprio nome da carta
  return r.def && r.name === r.def ? nomeCarta(r.def, r.name) : traduzir(r.name);
}

/**
 * F3: o texto de uma linha, montado pelas partes quando ela tem (cartas em português pela def). Linha antiga (de
 * checkpoint salvo) ou sem partes: o texto do motor, só com a tradução dos nomes.
 */
export function textoDaLinha(l: LogLinhaView, jogadores: readonly { name: string }[]): string {
  if (!l.parts?.length || !l.refs) return traduzir(l.text);
  return l.parts.map((p) => (typeof p === 'string' ? traduzir(p) : l.refs![p.ref] ? nomeDaRef(l.refs![p.ref], jogadores) : '')).join('');
}

// nomes de cartas citados num texto do motor ("Lim-Dûl's Vault: você olhou Sol Ring, Island…"), para a janela de
// escolha mostrar a imagem de cada uma em vez de só o nome
let RE_NOMES: RegExp | null = null;
let SUBTIPOS = new Set<string>();

/** as cartas (defs) citadas no texto, na ordem em que aparecem e sem repetir; fichas e nomes muito curtos ficam de fora */
export function cartasNoTexto(texto: string): string[] {
  if (!RE_NOMES) {
    SUBTIPOS = new Set(Object.values(INFO).flatMap((i) => i.tipo.split(' // ').flatMap((t) => (t.split(' — ')[1] ?? '').split(' '))));
    const nomes = Object.entries(INFO).filter(([n, i]) => !i.ficha && i.f && n.length >= 3).map(([n]) => n).sort((a, b) => b.length - a.length).map(escapar);
    RE_NOMES = nomes.length ? new RegExp(String.raw`(?<![\p{L}\p{N}])(` + nomes.join('|') + String.raw`)(?![\p{L}\p{N}])`, 'gu') : /$^/g;
  }
  const achadas: string[] = [];
  for (const m of texto.matchAll(RE_NOMES)) {
    // um nome que também é subtipo ("Hero", "Island") pode estar falando do tipo: "uma carta Hero", "Forest ou Island"
    if (SUBTIPOS.has(m[1])) {
      const antes = texto.slice(0, m.index), depois = texto.slice(m.index! + m[1].length);
      if (/\b(cartas?|tipos?|criaturas?|terrenos?|permanentes?|um|uma)( de)?\s+$|\bou\s+$/i.test(antes) || /^\s+ou\b/i.test(depois)) continue;
    }
    if (!achadas.includes(m[1])) achadas.push(m[1]);
  }
  return achadas;
}

/** monta a busca dos nomes com a mesa ociosa, para a primeira janela de escolha não travar */
export function prepararNomes(): void {
  const ocioso = (globalThis as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 500));
  ocioso(() => cartasNoTexto(''));
}
