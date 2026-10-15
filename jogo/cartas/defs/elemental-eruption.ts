// Elemental Eruption
// Create a 4/4 red Dragon Elemental creature token with flying and prowess.
// Storm (When you cast this spell, copy it for each spell cast before it this turn.)
import { createTokens, defineCard } from '../../motor/api.ts';
import { storm } from '../esquilos.ts';

export default defineCard({
  name: 'Elemental Eruption',
  faces: [{
    // CR 702.40a: tempestade (cartas/esquilos.ts)
    abilities: [storm()],
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Dragon Elemental', 1); },
    },
  }],
  rulings: {
    1: 'teste: as cópias da tempestade não são conjuradas e não contam para outra tempestade',
    2: 'teste: conta as mágicas de todos os jogadores, inclusive as anuladas',
    3: 'regra geral: CR 707.10 — cada cópia é anulada sozinha (motor/stack.ts counter)',
  },
});
