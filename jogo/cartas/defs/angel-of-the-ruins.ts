// Angel of the Ruins
// Flying
// When this creature enters, exile up to two target artifacts and/or enchantments.
// Plainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand,
// then shuffle.)
import { activated, chars, cost, defineCard, etb, exile, is, keyword, or, searchTo, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Angel of the Ruins',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        // CR 608.2b: só os alvos ainda legais são exilados
        const ids = tgtsAll(c, 0);
        if (ids.length) yield* exile(c.g, ids);
      }, {
        targets: [upTo(2, t.permanent(or(is.artifact, is.enchantment), 'até dois artefatos e/ou encantamentos alvo'))],
        text: 'Quando esta criatura entra, exile até dois artefatos e/ou encantamentos alvo.',
      }),
      // CR 702.29e-f: ciclagem de tipo — qualquer carta com o subtipo Planície (não precisa ser básica);
      // é uma habilidade de ciclagem
      activated([...cost('{2}'), { k: 'discardSelf' }], function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Plains'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Planície' });
      }, { kw: 'plainscycling', param: '{2}', zones: ['hand'], text: 'Ciclagem de Planície {2} ({2}, descarte esta carta: procure uma carta de Planície no seu grimório, revele-a, coloque-a na sua mão e depois embaralhe.)' }),
    ],
  }],
  rulings: {},
});
