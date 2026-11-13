// Korok, Liberated Rage
// Battlefront — Whenever Korok attacks, creatures you control get +X/+X until end of turn, where X is the number of
// opponents you attacked this turn.
import { controlledBy, defineCard, isCreature, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Korok, Liberated Rage',
  faces: [{
    abilities: [
      // Battlefront é palavra de habilidade (CR 207.2c), sem regra própria. X conta, na resolução, os oponentes que você
      // atacou neste turno (em todos os combates; planeswalkers não contam)
      triggered(on.selfAttacks(), function* (c) {
        const x = (c.g.state.turnStats[c.you]?.attackedPlayers ?? []).filter((p) => c.g.isOpponent(c.you, p)).length;
        if (x > 0) untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => isCreature(c.g, id)), [{ k: 'pt', p: x, t: x }]);
      }, { text: 'Frente de Batalha — Sempre que Korok ataca, as criaturas que você controla recebem +X/+X até o fim do turno, sendo X o número de oponentes que você atacou neste turno.' }),
    ],
  }],
  rulings: {},
});
