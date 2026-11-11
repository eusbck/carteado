// Gilded Drake
// Flying
// When this creature enters, exchange control of this creature and up to one target creature an opponent controls. If
// you don't or can't make an exchange, sacrifice this creature. This ability still resolves if its target becomes
// illegal.
import { defineCard, etb, exchangeControl, is, keyword, sacrifice, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Gilded Drake',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const alvo = tgt(c);
        // CR 701.12a-b (motor/controle.ts): a troca só acontece inteira; o alvo ilegal na resolução vira null
        const trocou = alvo !== null && exchangeControl(c.g, c.source, alvo, c.source);
        // rulings 1 e 2: sem troca, sacrifique este (quem o controla agora)
        if (!trocou && c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, {
        targets: [upTo(1, t.creature(is.opponents, 'até uma criatura alvo que um oponente controla'))],
        resolvesWithIllegalTargets: true,
        text: 'Quando esta criatura entra, troque o controle dela e de até uma criatura alvo que um oponente controla. Se você não fizer ou não puder fazer a troca, sacrifique esta criatura. Esta habilidade resolve mesmo que o alvo fique ilegal.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: se a criatura escolhida saiu do campo, sacrifique o Gilded Drake',
    2: 'teste: com o alvo ilegal na resolução (proteção), a habilidade resolve e você sacrifica o Gilded Drake',
  },
});
