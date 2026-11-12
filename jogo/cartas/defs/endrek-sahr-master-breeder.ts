// Endrek Sahr, Master Breeder
// Whenever you cast a creature spell, create X 1/1 black Thrull creature tokens, where X is that spell's mana value.
// When you control seven or more Thrulls, sacrifice Endrek Sahr.
import { controlledBy, createTokens, defineCard, isCreature, isSubtype, manaValue, on, sacrifice, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Endrek Sahr, Master Breeder',
  faces: [{
    abilities: [
      // o valor de mana é lido ao conjurar (ruling 3: virada para baixo vale 0)
      triggered(on.custom((e, c) => (e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj) ? { x: manaValue(c.g, e.obj) } : false)), function* (c) {
        yield* createTokens(c.g, c.you, 'Thrull', c.event.x as number);
      }, { text: 'Sempre que você conjura uma mágica de criatura, crie X fichas de criatura Thrull pretas 1/1, onde X é o valor de mana dessa mágica.' }),
      // ruling 1: gatilho de estado (CR 603.8); ruling 2: na resolução, sacrifica sem conferir de novo
      triggered({ kind: 'state', check: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Thrull')).length >= 7 }, function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, { text: 'Quando você controlar sete ou mais Thrulls, sacrifique Endrek Sahr.' }),
    ],
  }],
  rulings: {
    1: 'teste: com sete Thrulls, Endrek Sahr é sacrificado',
    2: 'teste: com sete Thrulls, Endrek Sahr é sacrificado',
    3: 'regra geral: CR 708.4 — mágica virada para baixo tem valor de mana 0 (motor/chars.ts)',
  },
});
