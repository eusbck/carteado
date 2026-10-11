// Peças repetidas nas cartas do deck Doom Prevails.
import { chooseItems, controllerOf } from '../motor/api.ts';
import type { Ctx, Gen, TargetSpec } from '../motor/defs.ts';
import { t } from '../motor/api.ts';
import type { PlayerId, TargetRef } from '../motor/types.ts';

/** quem uma ficha que "entra virada e atacando" ataca: o controlador escolhe entre os oponentes (CR 508.4) */
export function* escolheAtacado(c: Ctx, rotulo: string): Gen<TargetRef | null> {
  const ops = c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left);
  if (!ops.length || !c.g.state.combat) return null;
  if (ops.length === 1) return { kind: 'player', id: ops[0] };
  const [esc] = yield* chooseItems(c.g, c.you, `${rotulo}: quem a ficha ataca?`, ops.map((p) => ({ id: String(p), label: c.g.state.players[p].name })), 1, 1);
  return { kind: 'player', id: Number(esc) as PlayerId };
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
