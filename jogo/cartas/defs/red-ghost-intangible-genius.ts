// Red Ghost, Intangible Genius
// Ward {2}
// Red Ghost can't be blocked.
// Whenever you draw your second card each turn, create a 3/3 red Ape Villain creature token with haste.
import { createTokens, defineCard, on, staticAbility, triggered, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Red Ghost, Intangible Genius',
  faces: [{
    abilities: [
      // CR 702.21a
      ...ward('{2}'),
      staticAbility({ rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source }, text: 'Red Ghost não pode ser bloqueado.' }),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you && e.nth === 2), function* (c) {
        yield* createTokens(c.g, c.you, 'Ape Villain', 1);
      }, { text: 'Sempre que você compra a sua segunda carta em cada turno, crie uma ficha de criatura Ape Villain 3/3 vermelha com ímpeto.' }),
    ],
  }],
  rulings: {},
});
