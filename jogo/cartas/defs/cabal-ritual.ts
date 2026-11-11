// Cabal Ritual
// Add {B}{B}{B}.
// Threshold — Add {B}{B}{B}{B}{B} instead if there are seven or more cards in your graveyard.
import { addMana, defineCard } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Cabal Ritual',
  faces: [{
    spell: {
      *effect(c) {
        // limiar (CR 207.2c): contado na resolução, com a própria mágica ainda na pilha
        const n = c.g.state.zones.graveyard[c.you].length >= 7 ? 5 : 3;
        addMana(c.g, c.you, Array(n).fill('B') as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: {},
});
