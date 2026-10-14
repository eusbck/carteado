// Tireless Provisioner
// Landfall — Whenever a land you control enters, create a Food token or a Treasure token. (Food is an artifact with
// "{2}, {T}, Sacrifice this token: You gain 3 life." Treasure is an artifact with "{T}, Sacrifice this token: Add one
// mana of any color.")
import { chooseOne, createTokens, defineCard, on, triggered } from '../../motor/api.ts';
import { COMIDA } from '../esquilos.ts';

export default defineCard({
  name: 'Tireless Provisioner',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const qual = yield* chooseOne(c.g, c.you, 'Tireless Provisioner: crie uma ficha', [{ id: 'Food', label: 'Food' }, { id: 'Treasure', label: 'Treasure' }]);
        yield* createTokens(c.g, c.you, qual, 1);
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, crie uma ficha Food ou uma ficha Treasure.' }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
  },
});
