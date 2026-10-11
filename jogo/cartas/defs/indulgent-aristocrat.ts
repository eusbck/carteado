// Indulgent Aristocrat
// Lifelink
// {2}, Sacrifice a creature: Put a +1/+1 counter on each Vampire you control.
import { activated, addCounters, controlledBy, defineCard, isSubtype, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Indulgent Aristocrat',
  faces: [{
    abilities: [
      keyword('lifelink'),
      // ruling 1: pode sacrificar a si mesmo para pagar o custo
      activated('{2}, Sacrifice a creature', function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Vampire'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: '{2}, Sacrifique uma criatura: Coloque um marcador +1/+1 em cada Vampire que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificando a si mesmo, os outros Vampires ainda recebem o marcador',
  },
});
