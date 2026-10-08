// Skirsdag High Priest
// Morbid — {T}, Tap two untapped creatures you control: Create a 5/5 black Demon creature token with flying. Activate
// only if a creature died this turn.
import { activated, createTokens, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Skirsdag High Priest',
  faces: [{
    abilities: [activated('{T}, Tap two untapped creatures you control', function* (c) {
      yield* createTokens(c.g, c.you, 'Demon', 1);
    }, {
      // mórbido: qualquer criatura morreu neste turno, de qualquer jogador
      condition: (c) => c.g.state.turnStats.some((st) => st.creaturesDied > 0),
      text: 'Mórbido — {T}, Vire duas criaturas desviradas que você controla: Crie uma ficha de criatura Demon preta 5/5 com voar. Ative só se uma criatura morreu neste turno.',
    })],
  }],
  rulings: { 1: 'teste: as outras duas criaturas podem ter acabado de entrar' },
});
