// Tragic Slip
// Target creature gets -1/-1 until end of turn.
// Morbid — That creature gets -13/-13 until end of turn instead if a creature died this turn.
import { defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Tragic Slip',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // mórbido (CR 207.2c, palavra de habilidade): qualquer criatura, de qualquer jogador, morreu neste turno — checado na resolução
        const morbido = c.g.state.turnStats.some((st) => st.creaturesDied > 0);
        const n = morbido ? 13 : 1;
        untilEndOfTurn(c, [id], [{ k: 'pt', p: -n, t: -n }]);
      },
    },
  }],
  rulings: {},
});
