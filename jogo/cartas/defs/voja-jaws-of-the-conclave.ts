// Voja, Jaws of the Conclave
// Vigilance, trample, ward {3}
// Whenever Voja attacks, put X +1/+1 counters on each creature you control, where X is the number of Elves you control.
// Draw a card for each Wolf you control.
import { addCounters, controlledBy, defineCard, draw, isCreature, keywords, on, triggered, ward } from '../../motor/api.ts';
import { elfosDe, lobosDe } from '../voja.ts';

export default defineCard({
  name: 'Voja, Jaws of the Conclave',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample'),
      ...ward('{3}'),
      triggered(on.selfAttacks(), function* (c) {
        // CR 608.2h: X e o número de Lobos são contados na resolução
        const x = elfosDe(c.g, c.you).length;
        if (x > 0) for (const id of controlledBy(c.g, c.you, (i) => isCreature(c.g, i))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
        const lobos = lobosDe(c.g, c.you).length;
        if (lobos > 0) yield* draw(c.g, c.you, lobos);
      }, { text: 'Sempre que Voja ataca, coloque X marcadores +1/+1 em cada criatura que você controla, onde X é o número de Elfos que você controla. Compre uma carta para cada Lobo que você controla.' }),
    ],
  }],
  rulings: {},
});
