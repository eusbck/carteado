// Lórien Revealed
// Draw three cards.
// Islandcycling {1} ({1}, Discard this card: Search your library for an Island card, reveal it, put it into your hand,
// then shuffle.)
import { defineCard, draw, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Lórien Revealed',
  faces: [{
    // CR 702.29e: ciclagem de tipo; qualquer carta com o subtipo Island serve, básica ou não
    abilities: [typecycling('Island', '{1}')],
    spell: { *effect(c) { yield* draw(c.g, c.you, 3); } },
  }],
  rulings: {
    1: 'teste: a ciclagem de ilha procura uma carta de Island em vez de comprar',
    2: 'regra geral: CR 702.29e — ciclagem de tipo é ciclagem (motor/criaturas.ts typecycling, kw islandcycling)',
  },
});
