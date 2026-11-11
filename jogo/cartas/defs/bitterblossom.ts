// Bitterblossom
// At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.
import { createTokens, defineCard, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bitterblossom',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      loseLife(c.g, c.you, 1, c.source);
      yield* createTokens(c.g, c.you, 'Faerie Rogue', 1);
    }, { text: 'No início da sua manutenção, você perde 1 de vida e cria uma ficha de criatura Faerie Rogue preta 1/1 com voar.' })],
  }],
  rulings: {
    1: 'regra geral: CR 104.3a — com 0 de vida, você perde nas ações de estado antes de a ficha bloquear',
    2: 'regra geral: CR 119.3 — perder vida não é dano',
    3: 'regra geral: CR 308 — Kindred: é um encantamento Faerie, mas não uma criatura',
    4: 'regra geral: CR 603.2 — dispara uma vez por manutenção sua',
    5: 'regra geral: CR 111.4 — a ficha é sua mesmo se Bitterblossom mudar de controlador depois',
  },
});
