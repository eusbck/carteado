// Ninja Pizza
// Foods you control have "{T}, Sacrifice this artifact: Add one mana of any color."
// At the beginning of your second main phase, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this
// token: You gain 3 life.")
import { and, anthem, createTokens, defineAbility, defineCard, is, mana, onSecondMain, triggered } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

const MANA = defineAbility('Ninja Pizza:mana', { ...mana('any', { text: '{T}, Sacrifique este artefato: Adicione uma mana de qualquer cor.' }), cost: [{ k: 'tap' }, { k: 'sacrificeSelf' }] });

export default defineCard({
  name: 'Ninja Pizza',
  faces: [{
    abilities: [
      anthem(and(is.subtype('Food'), is.yours), () => [{ k: 'addAbility', id: MANA.id! }], 'Os Foods que você controla têm "{T}, Sacrifique este artefato: Adicione uma mana de qualquer cor."'),
      triggered(onSecondMain(), function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: 'No início da sua segunda fase principal, crie uma ficha Food.' }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.alvos,
    3: COMIDA.naoComa,
    4: COMIDA.qualquer,
  },
});