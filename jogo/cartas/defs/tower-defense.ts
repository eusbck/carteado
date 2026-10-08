// Tower Defense
// Creatures you control get +0/+5 and gain reach until end of turn.
import { creaturesOf, defineCard, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Tower Defense',
  faces: [{
    spell: {
      // ruling 1: só as criaturas que você controla na resolução (CR 611.2c)
      *effect(c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: 0, t: 5 }, { k: 'addKeyword', kw: 'reach' }]); },
    },
  }],
  rulings: { 1: 'teste: CR 611.2c: criaturas que chegam depois não ganham' },
});
