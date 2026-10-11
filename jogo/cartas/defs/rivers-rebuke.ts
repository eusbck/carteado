// River's Rebuke
// Return all nonland permanents target player controls to their owner's hand.
import { controllerOf, defineCard, isLand, returnToHand, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: "River's Rebuke",
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c, 0);
        if (p === null) return;
        const s = c.g.state;
        // os permanentes que ele controla na resolução, cada um para a mão do dono
        const ids = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(c.g, id) === p && !isLand(c.g, id));
        if (ids.length) yield* returnToHand(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: o símbolo de destaque da história não tem efeito no jogo',
  },
});
