// Ophiomancer
// At the beginning of each upkeep, if you control no Snakes, create a 1/1 black Snake creature token with deathtouch.
import { controlledBy, createTokens, defineCard, isCreature, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ophiomancer',
  faces: [{
    abilities: [triggered(on.upkeep('each'), function* (c) { yield* createTokens(c.g, c.you, 'Snake preta', 1); }, {
      // rulings 1-3: "se" interveniente; qualquer criatura Snake conta
      condition: (c) => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Snake')).length === 0,
      text: 'No início de cada manutenção, se você não controla Snakes, crie uma ficha de criatura Snake preta 1/1 com toque mortífero.',
    })],
  }],
  rulings: {
    1: 'teste: com uma Snake, não dispara',
    2: 'regra geral: CR 603.4 — a condição é conferida de novo na resolução',
    3: 'teste: qualquer criatura Snake conta, não só as fichas dele',
  },
});
