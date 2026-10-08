// Contas do arraste de permanentes no seu campo (sem DOM, testadas em testes/posicionar.test.ts).
// Coordenadas em pixels dentro do campo: (x, y) é o canto da carta de pé, como no `left`/`top`
// dela; a carta virada gira em torno do centro, então a caixa que aparece na tela é outra.
// A posição guardada pela sala é proporcional ao campo (de 0 a 1), para valer em qualquer tela.

/** carta no campo: canto e tamanho de pé (sem o giro de quando está virada) */
export interface Caixa { x: number; y: number; w: number; h: number; virada?: boolean }
export interface Retangulo { x0: number; y0: number; x1: number; y1: number }

/** o servidor aceita posições de -0,05 a 1,05 do campo */
export const MARGEM_SERVIDOR = 0.05;

/** o servidor guarda com 4 casas (menos de 0,2 px numa tela grande); o cliente arredonda igual */
export const arredondar = (n: number) => Math.round(n * 10000) / 10000;

/** a caixa que aparece na tela (a virada gira 90° em torno do centro) */
export function caixaVisual(c: Caixa): Retangulo {
  const o = c.virada ? (c.h - c.w) / 2 : 0;
  const w = c.virada ? c.h : c.w, h = c.virada ? c.w : c.h;
  const x0 = c.x - o, y0 = c.y + o;
  return { x0, y0, x1: x0 + w, y1: y0 + h };
}

/** até onde o canto da carta pode ir: a caixa na tela inteira dentro do campo, e no intervalo do servidor */
export function limites(c: Caixa, W: number, H: number): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const v = caixaVisual(c);
  const ox = c.x - v.x0, oy = c.y - v.y0;
  const xMin = Math.max(ox, -MARGEM_SERVIDOR * W), yMin = Math.max(oy, -MARGEM_SERVIDOR * H);
  const xMax = Math.min(W - (v.x1 - v.x0) + ox, (1 + MARGEM_SERVIDOR) * W);
  const yMax = Math.min(H - (v.y1 - v.y0) + oy, (1 + MARGEM_SERVIDOR) * H);
  // campo menor que a carta: fica encostada no começo
  return { xMin, xMax: Math.max(xMin, xMax), yMin, yMax: Math.max(yMin, yMax) };
}

/**
 * Deslocamento (dx, dy) do grupo inteiro, limitado para nenhuma carta sair do campo. Todas andam o
 * mesmo tanto, então a distância entre elas se mantém. Uma carta que já estava fora (posição de
 * outra tela) pode ficar onde está, só não vai mais para fora.
 */
export function limitarDeslocamento(cartas: Caixa[], dx: number, dy: number, W: number, H: number): { dx: number; dy: number } {
  let xLo = -Infinity, xHi = Infinity, yLo = -Infinity, yHi = Infinity;
  for (const c of cartas) {
    const l = limites(c, W, H);
    xLo = Math.max(xLo, Math.min(0, l.xMin - c.x));
    xHi = Math.min(xHi, Math.max(0, l.xMax - c.x));
    yLo = Math.max(yLo, Math.min(0, l.yMin - c.y));
    yHi = Math.min(yHi, Math.max(0, l.yMax - c.y));
  }
  const prender = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  return { dx: prender(dx, xLo, xHi), dy: prender(dy, yLo, yHi) };
}

/** canto em pixels → posição proporcional que vai para a sala */
export function proporcional(x: number, y: number, W: number, H: number): [number, number] {
  return [arredondar(W > 0 ? x / W : 0), arredondar(H > 0 ? y / H : 0)];
}

/** retângulo de seleção entre o ponto onde o botão desceu e o ponto atual, cortado pelo campo */
export function retangulo(ax: number, ay: number, bx: number, by: number, W: number, H: number): Retangulo {
  const corta = (n: number, max: number) => Math.min(max, Math.max(0, n));
  return { x0: corta(Math.min(ax, bx), W), y0: corta(Math.min(ay, by), H), x1: corta(Math.max(ax, bx), W), y1: corta(Math.max(ay, by), H) };
}

/** a carta entra na seleção quando a caixa dela na tela encosta no retângulo */
export function tocaRetangulo(c: Caixa, r: Retangulo): boolean {
  const v = caixaVisual(c);
  return v.x0 < r.x1 && v.x1 > r.x0 && v.y0 < r.y1 && v.y1 > r.y0;
}

/** posições confirmadas pelo servidor saem das locais; as que ainda não chegaram (ou mudaram de novo) ficam */
export function semConfirmadas(locais: Record<string, [number, number]>, servidor: Record<string, [number, number]>, valem: (id: string) => boolean): Record<string, [number, number]> {
  let mudou = false;
  const n: Record<string, [number, number]> = {};
  for (const [id, q] of Object.entries(locais)) {
    const s = servidor[id];
    // tolerância de um servidor que arredonde com 3 casas
    if (!valem(id) || (s && Math.abs(s[0] - q[0]) < 6e-4 && Math.abs(s[1] - q[1]) < 6e-4)) { mudou = true; continue; }
    n[id] = q;
  }
  return mudou ? n : locais;
}
