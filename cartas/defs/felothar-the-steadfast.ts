// Felothar the Steadfast
// Each creature you control assigns combat damage equal to its toughness rather than its power.
// Creatures you control can attack as though they didn't have defender.
// {3}, {T}, Sacrifice another creature: Draw cards equal to the sacrificed creature's toughness, then discard cards equal
// to its power.
import { activated, controllerOf, defineCard, discard, draw, lkiChars, staticAbility } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Felothar the Steadfast',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          assignsByToughness: (c, criatura) => controllerOf(c.g, criatura) === c.you,
          canAttackWithDefender: (c, criatura) => controllerOf(c.g, criatura) === c.you,
        },
        text: 'Cada criatura que você controla atribui dano de combate igual à resistência em vez da força. As criaturas que você controla podem atacar como se não tivessem defensor.',
      }),
      activated('{3}, {T}, Sacrifice another creature', function* (c) {
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        const ch = sac !== undefined ? lkiChars(c.g, sac) : null;
        const t = Math.max(0, ch?.toughness ?? 0);
        const p = Math.max(0, ch?.power ?? 0);
        if (t > 0) yield* draw(c.g, c.you, t);
        if (p > 0) yield* discard(c.g, c.you, p);
      }, { text: '{3}, {T}, Sacrifique outra criatura: Compre cartas igual à resistência da criatura sacrificada e depois descarte cartas igual à força dela.' }),
    ],
  }],
  rulings: { 1: 'teste: só o dano atribuído muda, a força continua' },
});
