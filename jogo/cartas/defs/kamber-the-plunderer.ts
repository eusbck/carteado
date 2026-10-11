// Kamber, the Plunderer
// Partner with Laurine, the Diversion (When this creature enters, target player may put Laurine into their hand from
// their library, then shuffle.)
// Lifelink
// Whenever a creature an opponent controls dies, you gain 1 life and create a Blood token. (It's an artifact with "{1},
// {T}, Discard a card, Sacrifice this token: Draw a card.")
import { createTokens, defineCard, gainLife, keyword, on, triggered } from '../../motor/api.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Kamber, the Plunderer',
  faces: [{
    abilities: [
      parceiroCom('Laurine, the Diversion'),
      keyword('lifelink'),
      triggered(on.dies((c, lki) => c.g.isOpponent(c.you, lki.controller)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
        yield* createTokens(c.g, c.you, 'Blood', 1);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, você ganha 1 de vida e cria uma ficha de Blood.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: ficha de Blood é qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos (cartas/vampiros.ts fichasDeSangue)',
    2: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    3: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma ficha de Blood',
  },
});
