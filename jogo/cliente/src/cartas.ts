// Imagens e textos das cartas (vindos do servidor uma vez, depois da autenticação).

import type { InfoCarta } from '../../servidor/protocolo.ts';

let INFO: Record<string, InfoCarta> = {};

export async function carregarCartas(): Promise<void> {
  INFO = await fetch('/api/cartas').then((r) => r.json());
  RE = null;
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
const VERSAO_FUNDO = 2;

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
  'Felothar the Steadfast': [0.37, 0.24],
  'Auntie Ool, Cursewretch': [0.36, 0.26],
  'Quintorius, History Chaser': [0.49, 0.25],
  'Jace, Multiverse Architect': [0.48, 0.21],
  'Rootha, Mastering the Moment': [0.43, 0.3],
  'Killian, Decisive Mentor': [0.67, 0.19],
  'Terra, Herald of Hope': [0.57, 0.19],
  'Dina, Essence Brewer': [0.49, 0.26],
  'Ghoulcaller Gisa': [0.43, 0.17],
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
