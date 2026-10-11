// Leadership Vacuum
// Target player returns each commander they control from the battlefield to the command zone.
// Draw a card.
import { controlledBy, defineCard, draw, moveObjects, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Leadership Vacuum',
  faces: [{
    spell: {
      // ruling 1: o alvo é o jogador, não os comandantes (resguardo e proteção deles não importam)
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p !== null) {
          const cmds = controlledBy(c.g, p, (id) => { const o = c.g.state.objects[id]; return o.card !== null && !!c.g.state.cards[o.card]?.isCommander; });
          if (cmds.length) yield* moveObjects(c.g, cmds.map((id) => ({ id, to: 'command' as const })), 'effect');
        }
        // ruling 2: compra mesmo que o jogador não controle comandante nenhum
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 115.1 — o alvo é o jogador; o comandante com resguardo ou proteção volta mesmo assim',
    2: 'teste: sem comandante no campo do jogador, você compra a carta mesmo assim',
    3: 'regra geral: CR 903.8 — a taxa de comandante conta as vezes em que ele foi conjurado da zona de comando, não as idas para lá (motor/stack.ts commanderTax)',
  },
});
