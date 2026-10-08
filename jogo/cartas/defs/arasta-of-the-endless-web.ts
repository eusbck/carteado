// Arasta of the Endless Web
// Reach
// Whenever an opponent casts an instant or sorcery spell, create a 1/2 green Spider creature token with reach.
import { createTokens, defineCard, isType, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Arasta of the Endless Web',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.obj] && (isType(c.g, e.obj, 'Instant') || isType(c.g, e.obj, 'Sorcery'))), function* (c) {
        yield* createTokens(c.g, c.you, 'Spider', 1);
      }, { text: 'Sempre que um oponente conjura uma mágica instantânea ou feitiço, crie uma ficha de criatura Spider verde 1/2 com alcance.' }),
    ],
  }],
  rulings: { 1: 'teste: CR 603.3: o gatilho resolve antes da mágica, mesmo que ela seja anulada' },
});
