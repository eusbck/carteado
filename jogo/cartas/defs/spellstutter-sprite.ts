// Spellstutter Sprite
// Flash
// Flying
// When this creature enters, counter target spell with mana value X or less, where X is the number of Faeries you
// control.
import { controlledBy, counter, defineCard, etb, isSubtype, keywords, manaValue, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** quantas Faeries você controla (um polimorfo conta) */
function fadas(c: SCtx): number {
  return controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Faerie')).length;
}

export default defineCard({
  name: 'Spellstutter Sprite',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      // ruling 1: X é contado ao escolher o alvo e de novo na resolução (CR 608.2b): com menos Faeries o alvo fica ilegal
      etb(function* (c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); }, {
        targets: [t.spell((c, id) => manaValue(c.g, id) <= fadas(c), 'mágica alvo com valor de mana X ou menos (X = Faeries que você controla)')],
        text: 'Quando esta criatura entra, anule a mágica alvo com valor de mana X ou menos, onde X é o número de Faeries que você controla.',
      }),
    ],
  }],
  rulings: { 1: 'teste: com menos Faeries na resolução, o alvo fica ilegal e a mágica resolve' },
});
