// Arrumação padrão do campo de um jogador: criaturas e outras permanentes em cima, terrenos
// embaixo; terrenos e fichas iguais ficam em leque e as Auras/Equipamentos ficam atrás da
// permanente em que estão presos. Se não couber, as cartas diminuem até um tamanho mínimo.
// O que fica por cima do campo (o avatar do oponente; na sua área a mão em repouso, as zonas e o seu retrato) é uma
// lista de retângulos que a arrumação deixa livres: cada peça pula para depois do retângulo que ela tocaria. No combate
// os leques de criaturas abrem (cada ficha à vista para o clique) e se separam pelo que cada uma faz no combate
// declarado; o tamanho das cartas nunca muda por causa do combate. Com os terrenos deitados, o terreno que não é
// criatura (e o que está preso nele) vira uma peça baixa e larga, com a arte recortada (Carta.tsx), e os terrenos iguais
// ficam num leque só, virados ou não (os virados embaixo).

import type { ObjId } from '../../../motor/types.ts';
import type { ObjView } from '../../../motor/view.ts';

export interface Posicao { x: number; y: number; z: number }
export interface Leque {
  x: number;
  y: number;
  n: number;
  ids: ObjId[];
  /** leque de terrenos deitados (o selo conta os virados: "×8 · 3 {T}") */
  deitado: boolean;
}
export interface Arrumacao {
  /** largura das cartas, em pixels */
  w: number;
  /** tamanho do terreno deitado (largura × altura), em pixels */
  tile: { w: number; h: number };
  pos: Map<ObjId, Posicao>;
  /** contagem dos leques com mais de uma carta, para o selo "×n" (com as cartas de cada um) */
  leques: Leque[];
  /** as cartas desenhadas deitadas: terrenos que não são criaturas e o que está preso neles */
  deitadas: ReadonlySet<ObjId>;
}

const PROPORCAO = 88 / 63;
/** o terreno deitado: 1,12 × 0,5 da largura da carta */
export const TILE_LARGURA = 1.12, TILE_ALTURA = .5;
export const tamanhoTile = (w: number) => ({ w: Math.round(w * TILE_LARGURA), h: Math.round(w * TILE_ALTURA) });
/** terreno que fica deitado: o que não é criatura (o terreno animado continua de pé) */
export const ehDeitavel = (o: ObjView) => o.types.includes('Land') && !o.types.includes('Creature');

/** o que muda a arrumação além das cartas e do tamanho do campo (sem nada: a arrumação de sempre) */
export interface OpcoesArrumacao {
  /** decisão de combate aberta nesta área: os leques de criaturas abrem, se couber no mesmo tamanho de carta */
  largo?: boolean;
  /** parte da chave do leque vinda do combate declarado: 'Ap2' (ataca o jogador 2), 'B17' (bloqueia o 17) */
  combate?: ReadonlyMap<ObjId, string>;
  /** terrenos deitados (Configurações › Terrenos no campo) */
  deitados?: boolean;
}

/** passo dos leques de criaturas abertos (fração da largura da carta), do mais aberto ao menos: fica o primeiro que cabe */
const PASSOS_LARGOS = [.72, .56, .42];

/** terrenos e fichas idênticos ficam juntos (cada carta continua clicável); no combate, só as que fazem o mesmo. Os
 *  terrenos deitados ficam juntos virados ou não, com os virados primeiro (embaixo) */
function agrupar(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, op: OpcoesArrumacao): ObjView[][] {
  const grupos: ObjView[][] = [];
  const deitado = (o: ObjView) => !!op.deitados && ehDeitavel(o);
  const chave = (o: ObjView) => (o.types.includes('Land') || o.token) && !anexos.has(o.id)
    ? `${o.def}|${o.name}|${deitado(o) ? '' : o.tapped}|${JSON.stringify(o.counters)}|${o.damage}|${o.sick}|${o.power}/${o.toughness}|${op.combate?.get(o.id) ?? ''}` : null;
  const porChave = new Map<string, ObjView[]>();
  for (const o of objs) {
    const k = chave(o);
    if (k === null) { grupos.push([o]); continue; }
    const g = porChave.get(k);
    if (g) g.push(o);
    else { const novo = [o]; porChave.set(k, novo); grupos.push(novo); }
  }
  // virados primeiro (embaixo), na ordem em que estavam
  for (const g of grupos) if (g.length > 1 && deitado(g[0]) && g.some((o) => o.tapped) && g.some((o) => !o.tapped)) g.sort((a, b) => Number(b.tapped) - Number(a.tapped));
  return grupos;
}

interface Peca { objs: ObjView[]; anexos: ObjView[]; deitada: boolean }

/** retângulo que a arrumação deixa livre, em coordenadas do campo */
export interface Vao { x0: number; x1: number; y0: number; y1: number }

/** `passoCriatura`: passo dos leques de criaturas, em fração de `w` (terrenos e as outras fichas ficam sempre em .3).
 *  `margem`: onde começam as linhas de cima (no combate, um respiro: a marcada para atacar inclina e sobe, e a da ponta
 *  esquerda saía da área). `largura`: até onde vai a peça mais à direita (uma peça mais larga que o campo não quebra
 *  linha nem conta em `cabe`) */
function tentar(cima: Peca[], baixo: Peca[], W: number, H: number, w: number, vaos: readonly Vao[], passoCriatura = .3, margem = 0): { arr: Arrumacao; cabe: boolean; largura: number } {
  const h = Math.round(w * PROPORCAO);
  const tile = tamanhoTile(w);
  const gap = Math.max(6, Math.round(w * .14));
  const passoLeque = Math.round(w * .3);
  const passoCriaturas = Math.round(w * passoCriatura);
  const passoTile = Math.max(6, Math.round(tile.w * .12));
  const passoDe = (p: Peca) => (p.deitada ? passoTile : p.objs[0].types.includes('Creature') ? passoCriaturas : passoLeque);
  const passoAnexo = Math.round(w * .2);
  const passoAnexoTile = Math.round(tile.h * .4);
  const pos = new Map<ObjId, Posicao>();
  const leques: Leque[] = [];
  const deitadas = new Set<ObjId>();
  let z = 1;
  let largura = 0;
  // tamanho de uma carta da peça como ela aparece (a virada de pé fica deitada pelo giro de 90°)
  const largCarta = (p: Peca) => (p.deitada ? tile.w : p.objs[0].tapped ? h : w);
  const altCarta = (p: Peca) => (p.deitada ? tile.h : p.objs[0].tapped ? w : h);
  const larg = (p: Peca) => largCarta(p) + (p.objs.length - 1) * passoDe(p);
  const alt = (p: Peca) => altCarta(p) + p.anexos.length * (p.deitada ? passoAnexoTile : passoAnexo);
  // a carta virada de pé gira em torno do centro: corrige para o canto visual ficar em (cx, cy); a deitada não gira
  const colocar = (o: ObjView, cx: number, cy: number, deitada: boolean) => {
    const off = !deitada && o.tapped ? (h - w) / 2 : 0;
    pos.set(o.id, { x: Math.round(cx + off), y: Math.round(cy - off), z: z++ });
    if (deitada) deitadas.add(o.id);
  };
  const peca = (p: Peca, x: number, base: number) => {
    // alinha pela base da linha
    const topoCarta = base - altCarta(p);
    const pa = p.deitada ? passoAnexoTile : passoAnexo;
    p.anexos.forEach((a, i) => colocar(a, x, topoCarta - (p.anexos.length - i) * pa, p.deitada));
    const passo = passoDe(p);
    p.objs.forEach((o, i) => colocar(o, x + i * passo, topoCarta, p.deitada));
    largura = Math.max(largura, x + larg(p));
    if (p.objs.length > 1) leques.push({ x: x - 4, y: topoCarta - 8, n: p.objs.length, ids: p.objs.map((o) => o.id), deitado: p.deitada });
  };

  // a peça que tocaria um retângulo livre pula para depois dele (de novo, até não tocar nenhum)
  const livre = (x: number, l: number, y0: number, y1: number) => {
    for (let k = 0; k < 64; k++) {
      const v = vaos.find((r) => x < r.x1 && x + l > r.x0 && y0 < r.y1 && y1 > r.y0);
      if (!v) return x;
      x = Math.round(v.x1 + gap);
    }
    return x;
  };
  let estourou = false;

  // de cima para baixo. A altura da linha só se sabe no fim dela: o teste com os retângulos usa a peça mais alta
  let x = margem, y = 0, linha: Peca[] = [], xs: number[] = [];
  let fundoCima = 0;
  const hMax = cima.length ? Math.max(...cima.map(alt)) : 0;
  const fecharLinha = () => {
    if (!linha.length) return;
    const a = Math.max(...linha.map(alt));
    linha.forEach((p, i) => peca(p, xs[i], y + a));
    fundoCima = y + a;
    y += a + gap;
    linha = []; xs = []; x = margem;
  };
  for (const p of cima) {
    const l = larg(p);
    for (let k = 0; ; k++) {
      const xx = livre(x, l, y, y + hMax);
      // cabe na linha (ou é a primeira e mais larga que o campo: fica, como sempre ficou)
      if (xx + l <= W || (xx === margem && !linha.length)) { linha.push(p); xs.push(xx); x = xx + l + gap; break; }
      if (linha.length) { fecharLinha(); continue; }
      // linha vazia e tomada pelos retângulos: desce um pouco
      if (y + hMax > H || k > 400) { estourou = true; linha.push(p); xs.push(xx); x = xx + l + gap; break; }
      y += Math.max(4, gap);
    }
  }
  fecharLinha();

  // terrenos de baixo para cima: cada linha tem a base conhecida, e cada peça é testada na altura dela
  let topoBaixo = H;
  if (baixo.length) {
    let yb = H, xb = 0, altLinha = 0;
    let linhaB: { p: Peca; x: number }[] = [];
    const fecharB = () => {
      if (!linhaB.length) return;
      for (const e of linhaB) peca(e.p, e.x, yb);
      topoBaixo = yb - altLinha;
      yb -= altLinha + gap * .6;
      linhaB = []; xb = 0; altLinha = 0;
    };
    for (const p of baixo) {
      const l = larg(p), a = alt(p);
      for (let k = 0; ; k++) {
        const xx = livre(xb, l, yb - a, yb);
        if (xx + l <= W || (xx === 0 && !linhaB.length)) { linhaB.push({ p, x: xx }); xb = xx + l + gap * .7; altLinha = Math.max(altLinha, a); break; }
        if (linhaB.length) { fecharB(); continue; }
        if (yb - a < 0 || k > 400) { estourou = true; linhaB.push({ p, x: xx }); xb = xx + l + gap * .7; altLinha = Math.max(altLinha, a); break; }
        yb -= Math.max(4, gap * .6);
      }
    }
    fecharB();
  }
  const cabe = !estourou && fundoCima + (cima.length && baixo.length ? gap : 0) <= topoBaixo && topoBaixo >= 0;
  return { arr: { w, tile, pos, leques, deitadas }, cabe, largura };
}

/**
 * O campo de um jogador: a arrumação padrão, com as permanentes que a pessoa pôs num lugar (x e y de
 * 0 a 1 do campo inteiro, `livreW` × `H`) por cima. A arrumação conta todas as permanentes, inclusive
 * as postas num lugar (o espaço delas fica guardado): assim mover uma carta não empurra as outras
 * nem muda o tamanho delas. As postas ficam por cima, na ordem de `ordemZ` (a maior por cima).
 */
export function arrumarCampo(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, posicoes: Record<string, [number, number]>, ordemZ: Record<string, number>,
  m: { W: number; livreW: number; H: number; wBase: number; wMin: number; vaos?: readonly Vao[] }, op: OpcoesArrumacao = {}): Arrumacao {
  const a = arrumar(objs, anexos, m.W, m.H, m.wBase, m.wMin, m.vaos ?? [], op);
  const deitada = (o: ObjView) => a.deitadas.has(o.id);
  // a carta virada de pé gira em torno do centro; os anexos ficam acima do canto dela como está, igual à arrumação
  const giro = (o: ObjView) => (o.tapped && !deitada(o) ? (Math.round(a.w * PROPORCAO) - a.w) / 2 : 0);
  let z = 200;
  const postas = objs.filter((o) => posicoes[o.id]).sort((p, q) => (ordemZ[p.id] ?? 0) - (ordemZ[q.id] ?? 0));
  for (const o of postas) {
    const q = posicoes[o.id];
    const presos = anexos.get(o.id) ?? [];
    const passoAnexo = deitada(o) ? Math.round(a.tile.h * .4) : Math.round(a.w * .2);
    const x = q[0] * m.livreW, y = q[1] * m.H;
    presos.forEach((an, i) => a.pos.set(an.id, { x: x - giro(o) + giro(an), y: y + giro(o) - giro(an) - (presos.length - i) * passoAnexo, z: z++ }));
    a.pos.set(o.id, { x, y, z: z++ });
  }
  return a;
}

export function arrumar(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, W: number, H: number, wBase: number, wMin: number, vaos: readonly Vao[] = [], op: OpcoesArrumacao = {}): Arrumacao {
  const terrenos = objs.filter((o) => o.types.includes('Land') && !o.types.includes('Creature'));
  const criaturas = objs.filter((o) => o.types.includes('Creature'));
  const outros = objs.filter((o) => !terrenos.includes(o) && !criaturas.includes(o));
  const pecas = (lista: ObjView[]): Peca[] => agrupar(lista, anexos, op).map((g) => ({ objs: g, anexos: g.length === 1 ? anexos.get(g[0].id) ?? [] : [], deitada: !!op.deitados && ehDeitavel(g[0]) }));
  const cima = [...pecas(criaturas), ...pecas(outros)];
  const baixo = pecas(terrenos);
  const cW = Math.max(W, 1), cH = Math.max(H, 1);
  let w = wBase;
  let t = tentar(cima, baixo, cW, cH, w, vaos);
  while (!t.cabe && w > wMin) {
    w = Math.max(wMin, Math.round(w * .92));
    t = tentar(cima, baixo, cW, cH, w, vaos);
  }
  // combate: o tamanho fica o de fora do combate; só o passo dos leques de criaturas abre, o quanto couber (na altura
  // e na largura do campo: um leque aberto não pode sair pela direita)
  // (e com um respiro à esquerda, para a marcada da ponta, que inclina e sobe, não sair da área)
  if (op.largo && t.cabe) {
    const margem = Math.round(w * .12);
    const leques = cima.some((p) => p.objs.length > 1 && p.objs[0].types.includes('Creature'));
    for (const passo of leques ? PASSOS_LARGOS : []) {
      const l = tentar(cima, baixo, cW, cH, w, vaos, passo, margem);
      if (l.cabe && l.largura <= cW) return l.arr;
    }
    const m = tentar(cima, baixo, cW, cH, w, vaos, .3, margem);
    if (m.cabe && m.largura <= cW) return m.arr;
  }
  return t.arr;
}
