// Dina, Essence Brewer
// Whenever you sacrifice a creature, draw a card. This ability triggers only once each turn.
// {2}, {T}, Sacrifice another creature: You gain X life and put X +1/+1 counters on target creature you control, where
// X is the sacrificed creature's power.
import { activated, addCounters, defineCard, draw, gainLife, is, lkiChars, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Dina, Essence Brewer',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && !!lkiChars(c.g, e.old)?.types.includes('Creature')), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { oncePerTurn: true, text: 'Sempre que você sacrifica uma criatura, compre uma carta. Esta habilidade só dispara uma vez a cada turno.' }),
      activated('{2}, {T}, Sacrifice another creature', function* (c) {
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        const x = Math.max(0, sac !== undefined ? lkiChars(c.g, sac)?.power ?? 0 : 0); // ruling 1
        gainLife(c.g, c.you, x, c.source);
        const id = tgt(c);
        if (id !== null && x > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: '{2}, {T}, Sacrifique outra criatura: Você ganha X de vida e coloca X marcadores +1/+1 na criatura alvo que você controla, onde X é a força da criatura sacrificada.' }),
    ],
  }],
  rulings: { 1: 'teste: X é a força da criatura no campo' },
});
