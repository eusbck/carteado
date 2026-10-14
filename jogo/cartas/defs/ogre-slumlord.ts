// Ogre Slumlord
// Whenever another nontoken creature dies, you may create a 1/1 black Rat creature token.
// Rats you control have deathtouch.
import { anthem, and, createTokens, defineCard, is, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Ogre Slumlord',
  faces: [{
    abilities: [
      triggered(on.dies((c, _l, old) => old.id !== c.source && !old.isToken), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Ogre Slumlord: criar uma ficha Rat 1/1?')) yield* createTokens(c.g, c.you, 'Rat', 1);
      }, { text: 'Sempre que outra criatura que não é ficha morre, você pode criar uma ficha de criatura Rat preta 1/1.' }),
      // ruling 1: todas as suas Rats, não só as criadas por ele
      anthem(and(is.creature, is.subtype('Rat'), is.yours), () => [{ k: 'addKeyword', kw: 'deathtouch' }], 'As Rats que você controla têm toque mortífero.'),
    ],
  }],
  rulings: {
    1: 'teste: uma criatura que não é ficha morre: cria uma Rat, que tem toque mortífero; ficha morrendo não dispara',
  },
});
