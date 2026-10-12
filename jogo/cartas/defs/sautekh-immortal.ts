// Sautekh Immortal
// Flash
// Elite Troops — This creature enters with a +1/+1 counter on it for each creature that died this turn.
import { defineCard, entersWithCounters, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Sautekh Immortal',
  faces: [{
    abilities: [
      keyword('flash'),
      // criaturas que morreram neste turno, de qualquer jogador
      entersWithCounters('+1/+1', (c) => c.g.state.turnStats.reduce((n, st) => n + (st.creaturesDied ?? 0), 0)),
    ],
  }],
  rulings: {},
});