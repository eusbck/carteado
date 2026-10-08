// Arrumação padrão do campo de um jogador: criaturas e outras permanentes em cima, terrenos
// embaixo; terrenos e fichas iguais ficam em leque e as Auras/Equipamentos ficam atrás da
// permanente em que estão presos. Se não couber, as cartas diminuem até um tamanho mínimo.

import type { ObjId } from '../../../motor/types.ts';
import type { ObjView } from '../../../motor/view.ts';

export interface Posicao { x: number; y: number; z: number }
export interface Arrumacao {
  /** largura das cartas, em pixels */
  w: number;
  pos: Map<ObjId, Posicao>;
  /** contagem dos leques com mais de uma carta, para o selo "×n" (com as cartas de cada um) */
  leques: { x: number; y: number; n: number; ids: ObjId[] }[];
}

const PROPORCAO = 88 / 63;

/** terrenos e fichas idênticos ficam juntos (cada carta continua clicável) */
function agrupar(objs: ObjView[], anexos: Map<ObjId, ObjView[]>): ObjView[][] {
  const grupos: ObjView[][] = [];
  const chave = (o: ObjView) => (o.types.includes('Land') || o.token) && !anexos.has(o.id)
    ? `${o.def}|${o.name}|${o.tapped}|${JSON.stringify(o.counters)}|${o.damage}|${o.sick}|${o.power}/${o.toughness}` : null;
  const porChave = new Map<string, ObjView[]>();
  for (const o of objs) {
    const k = chave(o);
    if (k === null) { grupos.push([o]); continue; }
    const g = porChave.get(k);
    if (g) g.push(o);
    else { const novo = [o]; porChave.set(k, novo); grupos.push(novo); }
  }
  return grupos;
}

interface Peca { objs: ObjView[]; anexos: ObjView[] }

function tentar(cima: Peca[], baixo: Peca[], W: number, H: number, w: number): { arr: Arrumacao; cabe: boolean } {
  const h = Math.round(w * PROPORCAO);
  const gap = Math.max(6, Math.round(w * .14));
  const passoLeque = Math.round(w * .3);
  const passoAnexo = Math.round(w * .2);
  const pos = new Map<ObjId, Posicao>();
  const leques: Arrumacao['leques'] = [];
  let z = 1;
  const larg = (p: Peca) => (p.objs[0].tapped ? h : w) + (p.objs.length - 1) * passoLeque;
  const alt = (p: Peca) => (p.objs[0].tapped ? w : h) + p.anexos.length * passoAnexo;
  // a carta virada gira em torno do centro: corrige para o canto visual ficar em (cx, cy)
  const colocar = (o: ObjView, cx: number, cy: number) => {
    const off = o.tapped ? (h - w) / 2 : 0;
    pos.set(o.id, { x: Math.round(cx + off), y: Math.round(cy - off), z: z++ });
  };
  const peca = (p: Peca, x: number, y: number, altLinha: number) => {
    // alinha pela base da linha
    const base = y + altLinha;
    const topoCarta = base - (p.objs[0].tapped ? w : h);
    p.anexos.forEach((a, i) => colocar(a, x, topoCarta - (p.anexos.length - i) * passoAnexo));
    p.objs.forEach((o, i) => colocar(o, x + i * passoLeque, topoCarta));
    if (p.objs.length > 1) leques.push({ x: x - 4, y: topoCarta - 8, n: p.objs.length, ids: p.objs.map((o) => o.id) });
  };

  // de cima para baixo
  let x = 0, y = 0, linha: Peca[] = [], xs: number[] = [];
  let fundoCima = 0;
  const fecharLinha = () => {
    if (!linha.length) return;
    const a = Math.max(...linha.map(alt));
    linha.forEach((p, i) => peca(p, xs[i], y, a));
    fundoCima = y + a;
    y += a + gap;
    linha = []; xs = []; x = 0;
  };
  for (const p of cima) {
    const l = larg(p);
    if (x > 0 && x + l > W) fecharLinha();
    linha.push(p); xs.push(x); x += l + gap;
  }
  fecharLinha();

  // terrenos de baixo para cima
  let topoBaixo = H;
  if (baixo.length) {
    const linhas: Peca[][] = [[]];
    x = 0;
    for (const p of baixo) {
      const l = larg(p);
      if (x > 0 && x + l > W) { linhas.push([]); x = 0; }
      linhas[linhas.length - 1].push(p); x += l + gap * .7;
    }
    let yb = H;
    for (const ln of linhas) {
      const a = Math.max(...ln.map(alt));
      yb -= a;
      let xb = 0;
      for (const p of ln) { peca(p, xb, yb, a); xb += larg(p) + gap * .7; }
      topoBaixo = yb;
      yb -= gap * .6;
    }
  }
  const cabe = fundoCima + (cima.length && baixo.length ? gap : 0) <= topoBaixo && topoBaixo >= 0;
  return { arr: { w, pos, leques }, cabe };
}

/**
 * O campo de um jogador: a arrumação padrão, com as permanentes que a pessoa pôs num lugar (x e y de
 * 0 a 1 do campo inteiro, `livreW` × `H`) por cima. A arrumação conta todas as permanentes, inclusive
 * as postas num lugar (o espaço delas fica guardado): assim mover uma carta não empurra as outras
 * nem muda o tamanho delas. As postas ficam por cima, na ordem de `ordemZ` (a maior por cima).
 */
export function arrumarCampo(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, posicoes: Record<string, [number, number]>, ordemZ: Record<string, number>,
  m: { W: number; livreW: number; H: number; wBase: number; wMin: number }): Arrumacao {
  const a = arrumar(objs, anexos, m.W, m.H, m.wBase, m.wMin);
  const passoAnexo = Math.round(a.w * .2);
  // a carta virada gira em torno do centro; os anexos ficam acima do canto dela como está, igual à arrumação
  const giro = (o: ObjView) => (o.tapped ? (Math.round(a.w * PROPORCAO) - a.w) / 2 : 0);
  let z = 200;
  const postas = objs.filter((o) => posicoes[o.id]).sort((p, q) => (ordemZ[p.id] ?? 0) - (ordemZ[q.id] ?? 0));
  for (const o of postas) {
    const q = posicoes[o.id];
    const presos = anexos.get(o.id) ?? [];
    const x = q[0] * m.livreW, y = q[1] * m.H;
    presos.forEach((an, i) => a.pos.set(an.id, { x: x - giro(o) + giro(an), y: y + giro(o) - giro(an) - (presos.length - i) * passoAnexo, z: z++ }));
    a.pos.set(o.id, { x, y, z: z++ });
  }
  return a;
}

export function arrumar(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, W: number, H: number, wBase: number, wMin: number): Arrumacao {
  const terrenos = objs.filter((o) => o.types.includes('Land') && !o.types.includes('Creature'));
  const criaturas = objs.filter((o) => o.types.includes('Creature'));
  const outros = objs.filter((o) => !terrenos.includes(o) && !criaturas.includes(o));
  const pecas = (lista: ObjView[]): Peca[] => agrupar(lista, anexos).map((g) => ({ objs: g, anexos: g.length === 1 ? anexos.get(g[0].id) ?? [] : [] }));
  const cima = [...pecas(criaturas), ...pecas(outros)];
  const baixo = pecas(terrenos);
  let w = wBase;
  for (;;) {
    const t = tentar(cima, baixo, Math.max(W, 1), Math.max(H, 1), w);
    if (t.cabe || w <= wMin) return t.arr;
    w = Math.max(wMin, Math.round(w * .92));
  }
}
