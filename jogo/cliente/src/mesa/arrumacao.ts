// Arrumação padrão do campo de um jogador: criaturas e outras permanentes em cima, terrenos
// embaixo; terrenos e fichas iguais ficam em leque e as Auras/Equipamentos ficam atrás da
// permanente em que estão presos. Se não couber, as cartas diminuem até um tamanho mínimo.
// O espaço do avatar (um vão no meio, em cima no oponente e embaixo na sua área) fica livre: as linhas pulam
// por cima dele.

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

/** vão que a arrumação deixa livre (o avatar): de x0 a x1 no campo, com `topo` px de altura em cima ou `baixo` px embaixo */
export interface Vao { x0: number; x1: number; topo?: number; baixo?: number }

function tentar(cima: Peca[], baixo: Peca[], W: number, H: number, w: number, vao?: Vao): { arr: Arrumacao; cabe: boolean } {
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

  // uma peça que cairia sobre o vão vai para depois dele (se ainda couber na linha; senão fica onde está)
  const pular = (x: number, l: number, naFaixa: boolean) => {
    if (!vao || !naFaixa || x >= vao.x1 || x + l <= vao.x0) return x;
    const nx = Math.round(vao.x1 + gap);
    return nx + l <= W ? nx : x;
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
  const emCima = () => y < (vao?.topo ?? 0);
  for (const p of cima) {
    const l = larg(p);
    let xx = pular(x, l, emCima());
    if (xx > 0 && xx + l > W) { fecharLinha(); xx = pular(0, l, emCima()); }
    linha.push(p); xs.push(xx); x = xx + l + gap;
  }
  fecharLinha();

  // terrenos de baixo para cima (a linha k começa a uns k linhas da base: as de baixo pulam o vão de baixo)
  let topoBaixo = H;
  if (baixo.length) {
    const linhas: { p: Peca; x: number }[][] = [[]];
    const naBase = () => (linhas.length - 1) * (h + gap * .6) < (vao?.baixo ?? 0);
    x = 0;
    for (const p of baixo) {
      const l = larg(p);
      let xx = pular(x, l, naBase());
      if (xx > 0 && xx + l > W) { linhas.push([]); xx = pular(0, l, naBase()); }
      linhas[linhas.length - 1].push({ p, x: xx }); x = xx + l + gap * .7;
    }
    let yb = H;
    for (const ln of linhas) {
      const a = Math.max(...ln.map((e) => alt(e.p)));
      yb -= a;
      for (const e of ln) peca(e.p, e.x, yb, a);
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
  m: { W: number; livreW: number; H: number; wBase: number; wMin: number; vao?: Vao }): Arrumacao {
  const a = arrumar(objs, anexos, m.W, m.H, m.wBase, m.wMin, m.vao);
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

export function arrumar(objs: ObjView[], anexos: Map<ObjId, ObjView[]>, W: number, H: number, wBase: number, wMin: number, vao?: Vao): Arrumacao {
  const terrenos = objs.filter((o) => o.types.includes('Land') && !o.types.includes('Creature'));
  const criaturas = objs.filter((o) => o.types.includes('Creature'));
  const outros = objs.filter((o) => !terrenos.includes(o) && !criaturas.includes(o));
  const pecas = (lista: ObjView[]): Peca[] => agrupar(lista, anexos).map((g) => ({ objs: g, anexos: g.length === 1 ? anexos.get(g[0].id) ?? [] : [] }));
  const cima = [...pecas(criaturas), ...pecas(outros)];
  const baixo = pecas(terrenos);
  let w = wBase;
  for (;;) {
    const t = tentar(cima, baixo, Math.max(W, 1), Math.max(H, 1), w, vao);
    if (t.cabe || w <= wMin) return t.arr;
    w = Math.max(wMin, Math.round(w * .92));
  }
}
