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

/** arte recortada da carta (fundo da área do jogador); null se não houver imagem */
export function urlArte(def: string): string | null {
  const i = INFO[def];
  return i?.f ? `/img/${i.f}/arte` : null;
}

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
