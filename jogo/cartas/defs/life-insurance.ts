// Life Insurance
// Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much
// life.)
// Whenever a nontoken creature dies, you lose 1 life and create a Treasure token. (It's an artifact with "{T},
// Sacrifice this token: Add one mana of any color.")
import { createTokens, defineCard, loseLife, on, triggered } from '../../motor/api.ts';
import { extort } from '../milagres.ts';

export default defineCard({
  name: 'Life Insurance',
  faces: [{
    abilities: [
      ...extort(),
      triggered(on.dies((_c, lki, obj) => lki.types.includes('Creature') && !obj.isToken), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que uma criatura que não é ficha morre, você perde 1 ponto de vida e cria uma ficha de Treasure.' }),
    ],
  }],
  rulings: {
    1: 'teste: extorquir: paga {W/B} na resolução, cada oponente perde 1 e você ganha o total',
    2: 'teste: extorquir: paga {W/B} na resolução, cada oponente perde 1 e você ganha o total',
    3: 'regra geral: CR 702.101a — o extorquir não mira ninguém (cartas/milagres.ts extort)',
    4: 'teste: extorquir: paga {W/B} na resolução, cada oponente perde 1 e você ganha o total',
  },
});
