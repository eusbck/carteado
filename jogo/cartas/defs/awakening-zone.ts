// Awakening Zone
// At the beginning of your upkeep, you may create a 0/1 colorless Eldrazi Spawn creature token. It has "Sacrifice this
// token: Add {C}."
import { createTokens, defineCard, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Awakening Zone',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      if (yield* yesNo(c.g, c.you, 'Awakening Zone: criar uma ficha Eldrazi Spawn?')) yield* createTokens(c.g, c.you, 'Eldrazi Spawn', 1);
    }, { text: 'No início da sua manutenção, você pode criar uma ficha de criatura Eldrazi Spawn incolor 0/1 com "Sacrifique esta ficha: Adicione {C}."' })],
  }],
  rulings: {},
});
