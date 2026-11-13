// Reclamation Specialist
// {1}, Sacrifice an artifact creature: Draw a card.
import { activated, defineCard, draw } from '../../motor/api.ts';
import { criaturaArtefato } from '../borg.ts';

export default defineCard({
  name: 'Reclamation Specialist',
  faces: [{
    abilities: [
      activated([{ k: 'mana', cost: '{1}' }, { k: 'sacrifice', n: 1, label: 'criatura artefato', filter: criaturaArtefato }], function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: '{1}, Sacrifique uma criatura artefato: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});
