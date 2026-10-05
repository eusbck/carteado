// Behind the Scenes
// Creatures you control have skulk. (They can't be blocked by creatures with greater power.)
// {4}{W}: Creatures you control get +1/+1 until end of turn.
import { activated, and, anthem, creaturesOf, defineCard, is, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Behind the Scenes',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours), () => [{ k: 'addKeyword', kw: 'skulk' }], 'As criaturas que você controla têm espreitar.'),
      activated('{4}{W}', function* (c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: 1, t: 1 }]); }, { text: '{4}{W}: As criaturas que você controla recebem +1/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.120 — compara a força real, mesmo negativa (motor/combat.ts)',
    2: 'teste: espreitar só vale na declaração de bloqueadores',
  },
});
