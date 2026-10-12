// Fast Forward
// This spell costs {1} less to cast for each opponent you attacked this turn.
// Goad all creatures your opponents control. (Until your next turn, those creatures attack each combat if able and
// attack a player other than you if able.)
import { allCreatures, controllerOf, defineCard, goad } from '../../motor/api.ts';

const INCITAR = 'regra geral: CR 701.15 — a criatura incitada ataca a cada combate se puder, e outro jogador que não quem a incitou se puder (motor/combat.ts)';

export default defineCard({
  name: 'Fast Forward',
  faces: [{
    selfCost: (c) => ({ reduce: c.g.state.turnStats[c.you].attackedPlayers.filter((p) => c.g.isOpponent(c.you, p)).length }),
    spell: {
      *effect(c) {
        for (const id of allCreatures(c.g)) if (c.g.isOpponent(c.you, controllerOf(c.g, id))) goad(c.g, id, c.you);
      },
    },
  }],
  rulings: {
    1: INCITAR,
    2: INCITAR,
    3: INCITAR,
    4: 'teste: custa {1} a menos para cada oponente que você atacou neste turno; incita todas as criaturas dos oponentes',
    5: 'regra geral: CR 701.15a — estar incitada não é habilidade da criatura: vale mesmo que ela perca as habilidades (GameObject.goadedBy)',
    6: INCITAR,
  },
});