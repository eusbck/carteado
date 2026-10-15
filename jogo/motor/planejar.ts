// Planejar / plot (CR 702.170, 116.2k): ação especial de exilar a carta da mão pagando o custo de planejar, e conjurá-la
// do exílio sem pagar o custo de mana num turno posterior, na sua fase principal com a pilha vazia. Usado por Lock and
// Load e Pyretic Charge (deck Quick Draw).
//
// Onde o motor faz a parte dele: priority.ts oferece a ação especial `plot:<id>` e a executa (doPlot); a conjuração do
// exílio é o custo alternativo `altCost` (zona 'exile', `free`, com momento próprio), montado pelo laço comum de
// castOptions como o da carta predita.

import { moveObjects } from './actions.ts';
import { chars, nameOf } from './chars.ts';
import { payMana } from './costs.ts';
import type { AltCastDef, Gen, SCtx, StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import { parseCost } from './mana.ts';
import type { ObjId, PlayerId } from './types.ts';

/** fase principal do próprio turno com a pilha vazia (CR 702.170a, 702.170d) */
function principalComPilhaVazia(g: G, p: PlayerId): boolean {
  const t = g.state.turn;
  return (t.step === 'main1' || t.step === 'main2') && t.active === p && g.state.zones.stack.length === 0;
}

/**
 * Planejar [custo] (CR 702.170a): `ability` vai em abilities (funciona na mão e marca a palavra-chave) e `altCost` em
 * altCosts (conjurar a carta planejada do exílio sem pagar o custo de mana, CR 702.170d).
 */
export function plot(custo: string): { ability: StaticDef; altCost: AltCastDef } {
  return {
    ability: {
      kind: 'static', kw: 'plot', param: custo, zones: ['hand'],
      text: `Planejar ${custo} (você pode pagar ${custo} e exilar esta carta da sua mão. Conjure-a como um feitiço num turno posterior sem pagar o custo de mana. Planejar só como um feitiço.)`,
    },
    altCost: {
      key: 'plot', label: 'Conjurar a carta planejada sem pagar o custo de mana', zone: 'exile', mana: '', free: true,
      // CR 702.170d: o dono, só a carta planejada e só num turno depois daquele em que ela foi planejada
      condition: (c: SCtx) => {
        const o = c.g.state.objects[c.source];
        const quando = plottedTurn(c.g, c.source);
        return !!o && o.zone === 'exile' && o.owner === c.you && quando !== null && c.g.state.turn.number > quando;
      },
      // CR 702.170d: na fase principal do dono, com a pilha vazia, seja qual for o tipo da carta
      timing: (c: SCtx) => principalComPilhaVazia(c.g, c.you),
    },
  };
}

/** o turno em que a carta no exílio foi planejada, ou null se ela não está planejada (CR 702.170a, 702.170c) */
export function plottedTurn(g: G, id: ObjId): number | null {
  const o = g.state.objects[id];
  const t = o?.zone === 'exile' ? (o.data.plotted as { turn: number } | undefined)?.turn : undefined;
  return typeof t === 'number' ? t : null;
}

/** custo de planejar da carta na mão, se ela tiver planejar */
export function plotParam(g: G, id: ObjId): string | null {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'hand') return null;
  const k = chars(g, id).abilities.find((a) => a.kw === 'plot');
  return typeof k?.param === 'string' ? k.param : null;
}

/** a ação especial de planejar pode ser feita agora? (CR 116.2k, 702.170a: o dono, na fase principal dele, pilha vazia) */
export function canPlot(g: G, p: PlayerId, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'hand' && o.owner === p && principalComPilhaVazia(g, p) && plotParam(g, id) !== null;
}

/** ação especial de planejar (CR 116.2k, 702.170a-b): paga o custo e exila a carta da mão, virada para cima */
export function* doPlot(g: G, p: PlayerId, id: ObjId): Gen<boolean> {
  if (!canPlot(g, p, id)) return false;
  const custo = plotParam(g, id)!;
  const pago = yield* payMana(g, p, parseCost(custo), { purpose: { kind: 'effect' }, canCancel: true, label: `planejar ${nameOf(g, id)}` });
  if (pago === null) return false;
  const [ex] = yield* moveObjects(g, [{ id, to: 'exile' }], 'plot', p);
  if (ex === null || ex === undefined || g.state.objects[ex]?.zone !== 'exile') return true;
  markPlotted(g, ex);
  g.log(`${g.state.players[p].name} planeja ${nameOf(g, ex)} (exila da mão; pode conjurá-la num turno posterior sem pagar o custo de mana).`, { rule: '702.170a' });
  return true;
}

/** a carta no exílio passa a ser uma carta planejada neste turno (CR 702.170c) */
export function markPlotted(g: G, id: ObjId): void {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'exile') return;
  o.data.plotted = { turn: g.state.turn.number };
  g.bump();
}
