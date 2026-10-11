// Laurine, the Diversion
// Partner with Kamber, the Plunderer (When this creature enters, target player may put Kamber into their hand from their
// library, then shuffle.)
// First strike
// {2}, Sacrifice an artifact or creature: Goad target creature. (Until your next turn, that creature attacks each combat
// if able and attacks a player other than you if able.)
import { activated, cost, defineCard, goad, is, keyword, or, t, tgt } from '../../motor/api.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Laurine, the Diversion',
  faces: [{
    abilities: [
      parceiroCom('Kamber, the Plunderer'),
      keyword('first strike'),
      activated([...cost('{2}'), { k: 'sacrifice', n: 1, filter: or(is.artifact, is.creature), label: 'um artefato ou criatura' }], function* (c) {
        const id = tgt(c);
        if (id !== null) goad(c.g, id, c.you);
      }, { targets: [t.creature()], text: '{2}, Sacrifique um artefato ou criatura: Goade a criatura alvo.' }),
    ],
  }],
  rulings: {},
});
