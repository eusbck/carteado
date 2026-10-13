// Minuta do Golpe (carta própria da mesa)
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Destroy target creature.
// II — Destroy all creatures with power 2 or less.
// III — You sacrifice a creature and you lose 3 life.
import { allCreatures, chapter, defineCard, destroy, eachSacrifices, isCreature, loseLife, power, sagaEnters, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Minuta do Golpe',
  faces: [{
    abilities: [
      sagaEnters(),
      chapter([1], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.creature()], text: 'I — Destrua a criatura alvo.' }),
      chapter([2], function* (c) {
        yield* destroy(c.g, allCreatures(c.g).filter((id) => power(c.g, id) <= 2));
      }, { text: 'II — Destrua todas as criaturas com poder 2 ou menos.' }),
      chapter([3], function* (c) {
        yield* eachSacrifices(c, [c.you], (id) => isCreature(c.g, id), 1, 'uma criatura');
        loseLife(c.g, c.you, 3, c.source);
      }, { text: 'III — Você sacrifica uma criatura e perde 3 pontos de vida.' }),
    ],
  }],
  rulings: {},
});
