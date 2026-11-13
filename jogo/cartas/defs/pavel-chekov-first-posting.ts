// Pavel Chekov, First Posting
// If you would draw a card, you may instead choose land or nonland and reveal cards from the top of your library until
// you reveal a card of the chosen kind. Put that card into your hand and put all other cards revealed this way on the
// bottom of your library in a random order.
import { chooseOne, defineCard, isLand, moveObjects, staticAbility, yesNo } from '../../motor/api.ts';
import { paraOFundoAleatorio, revelaAte } from '../startrek.ts';

export default defineCard({
  name: 'Pavel Chekov, First Posting',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          drawReplaceApplies: (c, p) => p === c.you,
          // CR 614.1a, 121.6: substituição opcional da compra; recusada, a compra é normal (motor/actions.ts draw)
          drawReplace: function* (c, p) {
            if (!(yield* yesNo(c.g, p, 'Pavel Chekov: em vez de comprar, revelar cartas até achar um terreno ou um não terreno?', 'Revelar', 'Comprar'))) return false;
            const tipo = yield* chooseOne(c.g, p, 'Pavel Chekov: escolha', [{ id: 'land', label: 'Terreno' }, { id: 'nonland', label: 'Não terreno' }]);
            const { achada, outras } = revelaAte(c.g, p, (id) => (tipo === 'land') === isLand(c.g, id));
            if (achada !== null) yield* moveObjects(c.g, [{ id: achada, to: 'hand' }], 'effect');
            paraOFundoAleatorio(c.g, p, outras);
            return true;
          },
        },
        text: 'Se você fosse comprar uma carta, em vez disso você pode escolher terreno ou não terreno e revelar cartas do topo do seu grimório até revelar uma carta do tipo escolhido. Coloque essa carta na sua mão e todas as outras cartas reveladas desta forma no fundo do seu grimório em ordem aleatória.',
      }),
    ],
  }],
  rulings: {},
});
