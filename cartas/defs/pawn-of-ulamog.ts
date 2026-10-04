// Pawn of Ulamog
// Whenever this creature or another nontoken creature you control dies, you may create a 0/1 colorless Eldrazi Spawn
// creature token. It has "Sacrifice this token: Add {C}."
import { createTokens, defineCard, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Pawn of Ulamog',
  faces: [{
    abilities: [triggered(on.dies((c, l, o) => l.controller === c.you && !o.isToken), function* (c) {
      if (yield* yesNo(c.g, c.you, 'Pawn of Ulamog: criar uma ficha Eldrazi Spawn?')) yield* createTokens(c.g, c.you, 'Eldrazi Spawn', 1);
    }, { text: 'Sempre que esta criatura ou outra criatura não ficha que você controla morre, você pode criar uma ficha de criatura Eldrazi Spawn incolor 0/1 com "Sacrifique esta ficha: Adicione {C}."' })],
  }],
  rulings: {
    1: 'teste: cada Pawn dispara para cada criatura',
    2: 'teste: CR 603.10a: várias criaturas (inclusive o Pawn) morrendo juntas disparam uma vez cada',
  },
});
