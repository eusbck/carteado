// Third Path Iconoclast
// Whenever you cast a noncreature spell, create a 1/1 colorless Soldier artifact creature token.
import { createTokens, defineCard, is, not, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Third Path Iconoclast',
  faces: [{
    abilities: [
      triggered(on.youCast(not(is.creature)), function* (c) {
        yield* createTokens(c.g, c.you, 'Soldier artefato', 1);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, crie uma ficha de criatura artefato Soldier 1/1 incolor.' }),
    ],
  }],
  rulings: {},
});
