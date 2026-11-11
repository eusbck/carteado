// Seven of Nine, Unassimilated
// At the beginning of your first main phase, draw a card. Then discard a card unless you control five or more
// differently named lands.
// {6}{U}: Seven of Nine's base power and toughness become 7/9. Activate only if you control seven or more differently
// named lands.
import { activated, addEffect, controlledBy, defineCard, discard, draw, isLand, nameOf, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

const nomesDeTerrenos = (g: G, p: PlayerId) => new Set(controlledBy(g, p, (id) => isLand(g, id)).map((id) => nameOf(g, id))).size;

export default defineCard({
  name: 'Seven of Nine, Unassimilated',
  faces: [{
    abilities: [
      triggered(on.firstMain(), function* (c) {
        yield* draw(c.g, c.you, 1);
        if (nomesDeTerrenos(c.g, c.you) < 5) yield* discard(c.g, c.you, 1);
      }, { text: 'No início da sua primeira fase principal, compre uma carta. Depois descarte uma carta, a menos que você controle cinco ou mais terrenos com nomes diferentes.' }),
      activated('{6}{U}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, affected: [c.source], duration: { kind: 'whileOnBattlefield', obj: c.source }, mods: [{ k: 'setPT', p: 7, t: 9 }] });
      }, {
        condition: (c) => nomesDeTerrenos(c.g, c.you) >= 7,
        text: '{6}{U}: A força e a resistência base de Seven of Nine viram 7/9. Ative apenas se você controlar sete ou mais terrenos com nomes diferentes.',
      }),
    ],
  }],
  rulings: {},
});
