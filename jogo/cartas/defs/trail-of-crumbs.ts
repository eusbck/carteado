// Trail of Crumbs
// When this enchantment enters, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain
// 3 life.")
// Whenever you sacrifice a Food, you may pay {1}. If you do, look at the top two cards of your library. You may reveal a
// permanent card from among them and put it into your hand. Put the rest on the bottom of your library in any order.
import { createTokens, defineCard, etb, isPermanentCard, mayPay, triggered } from '../../motor/api.ts';
import { olhaTopoEPoeUmaNaMao, voceSacrificaFood } from '../condado.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Trail of Crumbs',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: 'Quando este encantamento entra, crie uma ficha Food.' }),
      triggered(voceSacrificaFood(), function* (c) {
        if (!(yield* mayPay(c, c.you, '{1}', 'olhar as duas cartas do topo (Trail of Crumbs)'))) return;
        yield* olhaTopoEPoeUmaNaMao(c, 2, (id) => isPermanentCard(c.g, id), 'uma carta de permanente', 'Trail of Crumbs');
      }, { text: 'Sempre que você sacrifica uma Food, você pode pagar {1}. Se fizer isso, olhe as duas cartas do topo do seu grimório. Você pode revelar uma carta de permanente entre elas e pô-la na sua mão. Coloque o resto no fundo do seu grimório em qualquer ordem.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
    5: 'regra geral: o pagamento de {1} é uma pergunta só por resolução (motor/efeitos.ts mayPay)',
    6: 'teste: sacrificar uma Food e pagar {1} põe uma carta de permanente do topo na mão e o resto no fundo',
  },
});
