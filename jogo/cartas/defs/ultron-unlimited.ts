// Ultron, Unlimited
// Flying
// Whenever Ultron attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1
// counter on this creature.)
// Whenever a creature you control connives, you may pay {1}. If you do, create a 2/2 colorless Robot Villain artifact
// creature token.
import { connive, createTokens, defineCard, keyword, mayPay, on, onYouConnive, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ultron, Unlimited',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) { yield* connive(c.g, c.source); }, { text: 'Sempre que Ultron ataca, ele trama.' }),
      triggered(onYouConnive(), function* (c) {
        if (yield* mayPay(c, c.you, '{1}', 'criar uma ficha Robot Villain 2/2')) yield* createTokens(c.g, c.you, 'Robot Villain', 1);
      }, { text: 'Sempre que uma criatura que você controla trama, você pode pagar {1}. Se fizer isso, crie uma ficha de criatura artefato Robot Villain 2/2 incolor.' }),
    ],
  }],
  rulings: {},
});
