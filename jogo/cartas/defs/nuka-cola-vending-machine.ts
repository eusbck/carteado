// Nuka-Cola Vending Machine
// {1}, {T}: Create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")
// Whenever you sacrifice a Food, create a tapped Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add
// one mana of any color.")
import { activated, createTokens, defineCard, triggered } from '../../motor/api.ts';
import { COMIDA } from '../esquilos.ts';
import { voceSacrificaComida } from '../forragear.ts';

export default defineCard({
  name: 'Nuka-Cola Vending Machine',
  faces: [{
    abilities: [
      activated('{1}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: '{1}, {T}: Crie uma ficha Food.' }),
      // rulings 4-5: qualquer Food (ficha ou não), sacrificada por qualquer motivo
      triggered(voceSacrificaComida(), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1, { tapped: true });
      }, { text: 'Sempre que você sacrifica uma Food, crie uma ficha Treasure virada.' }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
    4: 'teste: sacrificando a Food para ganhar vida, cria um Treasure virado',
    5: 'teste: a Food sacrificada por outro motivo também conta',
  },
});
