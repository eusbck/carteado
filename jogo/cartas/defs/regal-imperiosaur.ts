// Regal Imperiosaur
// Other Dinosaurs you control get +1/+1.
import { and, anthem, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Regal Imperiosaur',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, is.other, is.subtype('Dinosaur')), () => [{ k: 'pt', p: 1, t: 1 }], 'Os outros Dinosaurs que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {},
});
