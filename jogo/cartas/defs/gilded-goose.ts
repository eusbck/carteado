// Gilded Goose
// Flying
// When this creature enters, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3
// life.")
// {1}{G}, {T}: Create a Food token.
// {T}, Sacrifice a Food: Add one mana of any color.
import { activated, createTokens, defineCard, etb, keywords, mana } from '../../motor/api.ts';
import { COMIDA } from '../esquilos.ts';

export default defineCard({
  name: 'Gilded Goose',
  faces: [{
    abilities: [
      ...keywords('flying'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: 'Quando esta criatura entra, crie uma ficha Food.' }),
      activated('{1}{G}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: '{1}{G}, {T}: Crie uma ficha Food.' }),
      mana('any', { cost: '{T}, Sacrifice a Food', text: '{T}, Sacrifique uma Food: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
    4: COMIDA.tipo,
  },
});
