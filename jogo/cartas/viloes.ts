// Peças repetidas nas cartas do deck Doom Prevails.
import { chars, chooseItems, controllerOf, nameOf } from '../motor/api.ts';
import type { Ctx, Gen, TargetSpec } from '../motor/defs.ts';
import { t } from '../motor/api.ts';
import type { PlayerId, TargetRef } from '../motor/types.ts';

/**
 * quem uma ficha que "entra virada e atacando" ataca: o controlador escolhe entre os oponentes e os planeswalkers deles
 * (CR 508.4); com uma opção só, não pergunta
 */
export function* escolheAtacado(c: Ctx, rotulo: string): Gen<TargetRef | null> {
  const s = c.g.state;
  const ops = c.g.opponents(c.you).filter((p) => !s.players[p].left);
  if (!ops.length || !s.combat) return null;
  const pws = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && ops.includes(controllerOf(c.g, id)) && chars(c.g, id).types.includes('Planeswalker'));
  if (ops.length === 1 && !pws.length) return { kind: 'player', id: ops[0] };
  const [esc] = yield* chooseItems(c.g, c.you, `${rotulo}: quem a ficha ataca?`, [
    ...ops.map((p) => ({ id: String(p), label: s.players[p].name, player: p })),
    ...pws.map((id) => ({ id: `o${id}`, label: `${nameOf(c.g, id)} (planeswalker de ${s.players[controllerOf(c.g, id)].name})`, obj: id })),
  ], 1, 1);
  return esc.startsWith('o') ? { kind: 'obj', id: Number(esc.slice(1)) } : { kind: 'player', id: Number(esc) as PlayerId };
}

/** "para cada oponente, até uma criatura alvo que esse jogador controla": uma lista só, no máximo uma por oponente */
export function umaPorOponente(label: string, extra: (c: Parameters<NonNullable<TargetSpec['filter']>>[0], id: number) => boolean = () => true): TargetSpec {
  return {
    ...t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)) && extra(c, id), label),
    min: 0, max: (c) => c.g.opponents(c.you).length,
    validateSet: (c, escolhidos) => {
      const donos = escolhidos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
      return new Set(donos).size === donos.length;
    },
  };
}
