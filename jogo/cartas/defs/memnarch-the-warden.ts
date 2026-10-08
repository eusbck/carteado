// Memnarch, the Warden
// Indestructible
// When Memnarch enters, create two 1/1 colorless Myr artifact creature tokens.
// Whenever Memnarch attacks, draw a card for each artifact you control.
import { controlledBy, createTokens, defineCard, draw, etb, isType, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Memnarch, the Warden',
  faces: [{
    abilities: [
      keyword('indestructible'),
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Myr', 2);
      }, { text: 'Quando Memnarch entra, crie duas fichas de criatura artefato Myr incolores 1/1.' }),
      triggered(on.selfAttacks(), function* (c) {
        // CR 608.2h: a quantidade de artefatos é contada na resolução
        const n = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que Memnarch ataca, compre uma carta para cada artefato que você controla.' }),
    ],
  }],
  rulings: {},
});
