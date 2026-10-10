// Medidas de uma área de jogador que só dependem do tamanho dela (sem DOM, testadas em testes/arrumacao.test.ts): o
// campo, o tamanho das zonas, da mão e do avatar, e os retângulos que a arrumação padrão deixa livres.
//
// A sua área usa a altura inteira: o campo vai até a base e a mão, as zonas e o retrato ficam por cima dele. A mão
// descansa abaixada (só uns 41% da carta à vista) e sobe inteira com o mouse em cima; a arrumação padrão evita só o
// que fica por cima do campo em repouso (a faixa da mão no meio, os dois grupos de zonas nos cantos de baixo e o
// retrato quando ele fica à esquerda), e não uma faixa da largura toda. A faixa da mão é a de sete cartas (ou mais,
// se a mão tiver mais): comprar uma carta não faz os terrenos mudarem de lugar.

import type { Vao } from './arrumacao.ts';

export const PROPORCAO = 88 / 63;
export const limitar = (min: number, x: number, max: number) => Math.round(Math.max(min, Math.min(max, x)));

/** quanto da carta da mão aparece com a mão em repouso */
export const MAO_VISIVEL = .41;

/** onde fica o seu retrato: no canto de cima à direita (padrão) ou à esquerda, numa coluna acima do Comando */
export type LadoAvatar = 'canto' | 'esquerda';

export interface EntradaArea {
  /** tamanho da área (a seção inteira), em px */
  w: number;
  h: number;
  /** a sua área (com a mão) */
  eu: boolean;
  compacta: boolean;
  duelo: boolean;
  lado?: LadoAvatar;
  /** cartas na mão (a sua área) */
  nMao?: number;
  /** a zona de comando tem emblemas (a coluna deles fica ao lado do Comando) */
  emblemas?: boolean;
  /** largura à direita do campo que fica livre para a coluna da pilha e das decisões */
  reservaDireita?: number;
}

export interface Mao {
  /** largura e altura da carta da mão */
  wm: number;
  hm: number;
  /** distância entre as cartas (margem negativa), giro máximo, curva do leque */
  passo: number;
  giro: number;
  curva: number;
  /** a mão erguida: a base das cartas fica a `baixo` px da borda da área */
  baixo: number;
  /** a mão em repouso desce `repouso` px */
  repouso: number;
}

export interface MedidasArea {
  /** largura das cartas das zonas e altura da fileira de zonas */
  wz: number;
  zonasH: number;
  /** o campo começa a `topo` px do topo da área e termina a `baixo` px da base */
  topo: number;
  baixo: number;
  /** largura da arrumação padrão (sem a reserva da direita), largura inteira (para as posições escolhidas) e altura */
  campoW: number;
  livreW: number;
  campoH: number;
  wBase: number;
  wMin: number;
  tamAvatar: number;
  /** o que a arrumação padrão deixa livre, em coordenadas do campo */
  vaos: Vao[];
  mao: Mao | null;
}

/** largura do leque da mão com n cartas, cabendo em `livre` */
function passoDaMao(n: number, wm: number, livre: number): number {
  return n > 1 ? Math.min(wm * .8, (livre - wm) / (n - 1)) : wm;
}

/** giro (graus) de cada carta a partir do meio e a curva (px por carta², para baixo) do leque com n cartas */
const giroDaMao = (n: number) => (n > 1 ? Math.min(8, 52 / (n - 1)) : 0);
const curvaDaMao = (n: number, wm: number) => { const meio = (n - 1) / 2; return meio > 0 ? (wm * .34) / (meio * meio) : 0; };

/**
 * A parte do leque em repouso que aparece acima da base da área (x0..x1, e o topo): cada carta como o estilo a põe
 * (.mao-cartas .carta: centradas na área, a base a `baixo` px da borda, descidas `repouso` px mais a curva, e giradas em
 * torno de um ponto 40% da altura abaixo delas), medida por pontos das bordas. As das pontas giram para fora e descem.
 */
function faixaDaMao(n: number, wm: number, hm: number, passo: number, baixo: number, repouso: number, w: number, h: number): { x0: number; x1: number; topo: number } {
  const giro = giroDaMao(n), curva = curvaDaMao(n, wm), meio = (n - 1) / 2;
  const x0 = w / 2 - (wm + (n - 1) * passo) / 2;
  const topoCarta = h - baixo - hm;
  let a = Infinity, b = -Infinity, topo = h;
  for (let i = 0; i < n; i++) {
    const r = ((i - meio) * giro * Math.PI) / 180, cos = Math.cos(r), sen = Math.sin(r);
    const px = x0 + i * passo + wm / 2, py = topoCarta + hm * 1.4;
    const ty = Math.round((i - meio) ** 2 * curva) + repouso;
    // pontos das quatro bordas da carta
    for (let k = 0; k <= 8; k++) {
      const f = k / 8;
      for (const [cx, cy] of [[f * wm, 0], [f * wm, hm], [0, f * hm], [wm, f * hm]]) {
        const dx = x0 + i * passo + cx - px, dy = topoCarta + cy - py;
        const x = px + dx * cos - dy * sen, y = py + dx * sen + dy * cos + ty;
        if (y > h) continue;
        a = Math.min(a, x); b = Math.max(b, x); topo = Math.min(topo, y);
      }
    }
  }
  return a <= b ? { x0: a, x1: b, topo } : { x0: w / 2, x1: w / 2, topo: h };
}

export function medirArea(e: EntradaArea): MedidasArea {
  const { w, h } = e;
  const wz = e.compacta ? (e.duelo ? limitar(44, h * .13, 56) : limitar(34, h * .1, 42)) : limitar(54, h * .13, 76);
  const zonasH = Math.round(wz * PROPORCAO) + 26;
  const topo = e.compacta ? 44 : 58;
  const wBase = e.compacta ? (e.duelo ? limitar(54, h * .19, 84) : limitar(40, h * .15, 62)) : limitar(62, h * .17, 92);
  const wMin = e.compacta ? 28 : 40;
  const livreW = Math.max(0, w - 24);
  const campoW = Math.max(0, w - 24 - (e.reservaDireita ?? 0));

  if (!e.eu) {
    // oponente: o campo termina acima das zonas e o medalhão fica no canto de cima à direita, sobre o campo
    const tamAvatar = e.compacta && !e.duelo ? limitar(48, h * .17, 84) : limitar(60, h * .17, 100);
    const altAvatar = Math.round(tamAvatar * 1.42) + 22;
    const campoH = Math.max(0, h - topo - zonasH);
    const vaoAlt = Math.max(0, 8 + altAvatar - topo);
    const vaos = vaoAlt > 0 ? [{ x0: Math.round(w - 26 - tamAvatar * 1.25 - 10), x1: Math.round(w), y0: 0, y1: vaoAlt }] : [];
    return { wz, zonasH, topo, baixo: zonasH, campoW, livreW, campoH, wBase, wMin, tamAvatar, vaos, mao: null };
  }

  // a sua área: o campo vai até a base
  const baixo = 6;
  const campoH = Math.max(0, h - topo - baixo);
  const lado = e.lado ?? 'canto';
  const tamAvatar = lado === 'canto' ? limitar(60, h * .17, 100) : limitar(56, h * .145, 88);
  const wm = limitar(72, h * .18, 108);
  const hm = Math.round(wm * PROPORCAO);
  const livreMao = Math.max(wm, w - 2 * (3 * (wz + 12) + 30) - wm * 1.3);
  const n = e.nMao ?? 0;
  const mao: Mao = {
    wm, hm,
    passo: passoDaMao(n, wm, livreMao),
    giro: giroDaMao(n),
    curva: curvaDaMao(n, wm),
    baixo: 4,
    repouso: Math.round(hm * (1 - MAO_VISIVEL)),
  };

  // em coordenadas do campo (o campo começa 12 px à direita da borda da área e `topo` px abaixo do topo)
  const cx = (x: number) => Math.round(x - 12), cy = (y: number) => Math.round(y - topo);
  const vaos: Vao[] = [];
  // a faixa da mão em repouso (a de sete cartas, ou mais), com o rótulo "Mão (n)" acima dela e uma folga dos lados
  const nFaixa = Math.max(n, 7);
  const f = faixaDaMao(nFaixa, wm, hm, passoDaMao(nFaixa, wm, livreMao), mao.baixo, mao.repouso, w, h);
  vaos.push({ x0: cx(f.x0 - 8), x1: cx(f.x1 + 8), y0: cy(f.topo - 30), y1: cy(h) });
  // os dois grupos de zonas nos cantos de baixo (Comando à esquerda; grimório, cemitério e exílio à direita)
  const topoZonas = h - 8 - zonasH - 6;
  const largEsq = Math.max(wz, 64) + (e.emblemas ? 132 : 0);
  const largDir = 3 * Math.max(wz, 86) + 2 * 12;
  // o retrato à esquerda fica numa coluna acima do Comando
  const altAvatar = Math.round(tamAvatar * 1.42) + 22;
  const topoEsq = lado === 'esquerda' ? topoZonas - altAvatar - 10 : topoZonas;
  const largColuna = lado === 'esquerda' ? Math.max(largEsq, tamAvatar * 1.3) : largEsq;
  vaos.push({ x0: cx(0), x1: cx(14 + largColuna + 8), y0: cy(topoEsq), y1: cy(h) });
  vaos.push({ x0: cx(w - 14 - largDir - 8), x1: cx(w), y0: cy(topoZonas), y1: cy(h) });
  // o retrato no canto fica sobre a faixa reservada à coluna da pilha (a arrumação não chega lá); o vão vale se não
  // houver reserva
  if (lado === 'canto') vaos.push({ x0: cx(w - 26 - tamAvatar * 1.25 - 10), x1: cx(w), y0: -topo, y1: Math.max(0, 8 + altAvatar - topo) });
  return { wz, zonasH, topo, baixo, campoW, livreW, campoH, wBase, wMin, tamAvatar, vaos, mao };
}
