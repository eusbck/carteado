// Nadir Kraken
// Whenever you draw a card, you may pay {1}. If you do, put a +1/+1 counter on this creature and create a 1/1 blue
// Tentacle creature token.
import { addCounters, createTokens, defineCard, mayPay, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Nadir Kraken',
  faces: [{
    abilities: [
      // ruling 2: um gatilho por carta comprada; ruling 1: {1} uma vez só por gatilho
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function* (c) {
        if (!(yield* mayPay(c, c.you, '{1}', 'pôr um marcador +1/+1 em Nadir Kraken e criar um Tentacle 1/1'))) return;
        // ruling 3: se o Kraken saiu do campo, ainda vem o Tentacle
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* createTokens(c.g, c.you, 'Tentacle', 1);
      }, { text: 'Sempre que você compra uma carta, você pode pagar {1}. Se fizer isso, coloque um marcador +1/+1 nesta criatura e crie uma ficha de criatura Tentacle 1/1 azul.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 118.12 — o pagamento opcional é feito uma vez só na resolução (motor/efeitos.ts mayPay)',
    2: 'teste: um gatilho por carta comprada; pagando {1}, ganha um marcador e um Tentacle',
    3: 'teste: se o Kraken já saiu do campo, pagando {1} ainda vem o Tentacle',
  },
});
