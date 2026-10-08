// Plumb the Forbidden
// As an additional cost to cast this spell, you may sacrifice one or more creatures. When you do, copy this spell for
// each creature sacrificed this way.
// You draw a card and lose 1 life.
import { copySpell, defineCard, draw, is, loseLife, onCastThis, timesPaid } from '../../motor/api.ts';

export default defineCard({
  name: 'Plumb the Forbidden',
  faces: [{
    additionalCosts: [{ key: 'sacrificar', label: 'sacrificar uma criatura', parts: [{ k: 'sacrifice', n: 1, label: 'criatura', filter: is.creature }], optional: true, repeatable: true }],
    abilities: [onCastThis(function* (c) {
      const n = timesPaid(c.g, c.source, 'sacrificar');
      for (let i = 0; i < n; i++) yield* copySpell(c.g, c.source, c.you);
    }, 'Quando você sacrificar criaturas para conjurar esta mágica, copie-a para cada criatura sacrificada.')],
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: magecraft dispara para cada cópia',
    2: 'regra geral: a criatura sacrificada já saiu do campo quando a mágica é conjurada',
  },
});
