// Blossoming Bogbeast
// Whenever this creature attacks, you gain 2 life. Then creatures you control gain trample and get +X/+X until end of
// turn, where X is the amount of life you gained this turn.
import { creaturesOf, defineCard, gainLife, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Blossoming Bogbeast',
  faces: [{
    abilities: [triggered(on.selfAttacks(), function* (c) {
      gainLife(c.g, c.you, 2, c.source);
      // ruling 1: toda a vida ganha no turno, sem descontar a perdida
      const x = c.g.state.turnStats[c.you].lifeGained;
      untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'trample' }, { k: 'pt', p: x, t: x }]);
    }, { text: 'Sempre que esta criatura ataca, você ganha 2 de vida. Depois, as criaturas que você controla ganham atropelar e recebem +X/+X até o fim do turno, onde X é a vida que você ganhou neste turno.' })],
  }],
  rulings: { 1: 'teste: X conta toda a vida ganha no turno, sem descontar a perdida' },
});
