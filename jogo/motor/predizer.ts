// Predizer / foretell (CR 702.143, 116.2h): ação especial de exilar a carta da mão virada para baixo pagando {2}, e
// conjurá-la do exílio num turno posterior pelo custo de predizer. Usado por Sage of the Beyond.

import { moveObjects } from './actions.ts';
import { chars, nameOf } from './chars.ts';
import { payMana } from './costs.ts';
import type { AltCastDef, Gen, StaticDef } from './defs.ts';
import type { G } from './game-context.ts';
import { parseCost } from './mana.ts';
import type { ObjId, PlayerId } from './types.ts';

/** o custo da ação especial de predizer (CR 702.143a) */
export const CUSTO_PREDIZER = '{2}';

/**
 * Predizer [custo] (CR 702.143a): `ability` vai em abilities (funciona na mão e marca a palavra-chave) e `altCost` em
 * altCosts (conjurar a carta predita do exílio, depois do turno em que foi predita, pelo custo de predizer).
 */
export function foretell(custo: string): { ability: StaticDef; altCost: AltCastDef } {
  return {
    ability: {
      kind: 'static', kw: 'foretell', param: custo, zones: ['hand'],
      text: `Predizer ${custo} (durante o seu turno, você pode pagar {2} e exilar esta carta da sua mão virada para baixo. Conjure-a num turno posterior pelo custo de predizer.)`,
    },
    altCost: {
      key: 'foretell', label: `Conjurar a carta predita por ${custo}`, zone: 'exile', mana: custo,
      // só o dono, só a carta predita e só depois do turno em que ela foi predita (CR 702.143a)
      condition: (c) => {
        const o = c.g.state.objects[c.source];
        const quando = foretoldTurn(c.g, c.source);
        return !!o && o.zone === 'exile' && o.owner === c.you && quando !== null && c.g.state.turn.number > quando;
      },
    },
  };
}

/** o turno em que a carta no exílio foi predita, ou null se ela não está predita (CR 702.143c) */
export function foretoldTurn(g: G, id: ObjId): number | null {
  const o = g.state.objects[id];
  const t = o?.zone === 'exile' ? (o.data.foretold as { turn: number } | undefined)?.turn : undefined;
  return typeof t === 'number' ? t : null;
}

/** custo de predizer da carta na mão, se ela tiver predizer */
export function foretellParam(g: G, id: ObjId): string | null {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'hand') return null;
  const k = chars(g, id).abilities.find((a) => a.kw === 'foretell');
  return typeof k?.param === 'string' ? k.param : null;
}

/** a ação especial de predizer pode ser feita agora? (CR 116.2h: o dono, com prioridade, durante o turno dele) */
export function canForetell(g: G, p: PlayerId, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'hand' && o.owner === p && g.state.turn.active === p && foretellParam(g, id) !== null;
}

/** ação especial de predizer (CR 116.2h, 702.143a-b): paga {2} e exila a carta da mão virada para baixo; o dono pode olhá-la */
export function* doForetell(g: G, p: PlayerId, id: ObjId): Gen<boolean> {
  if (!canForetell(g, p, id)) return false;
  const pago = yield* payMana(g, p, parseCost(CUSTO_PREDIZER), { purpose: { kind: 'effect' }, canCancel: true, label: `predizer ${nameOf(g, id)}` });
  if (pago === null) return false;
  const [ex] = yield* moveObjects(g, [{ id, to: 'exile', faceDown: true, visibleTo: [p] }], 'foretell', p);
  if (ex === null || ex === undefined || g.state.objects[ex]?.zone !== 'exile') return true;
  g.state.objects[ex].data.foretold = { turn: g.state.turn.number };
  g.bump();
  g.log(`${g.state.players[p].name} prediz uma carta (exila da mão virada para baixo).`, { rule: '702.143a' });
  return true;
}
