// Breena, the Demagogue
// Flying
// Whenever a player attacks one of your opponents, if that opponent has more life than another of your opponents, that
// attacking player draws a card and you put two +1/+1 counters on a creature you control.
import { addCounters, chooseItems, creaturesOf, defineCard, draw, keyword, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Breena, the Demagogue',
  faces: [{
    abilities: [
      keyword('flying'),
      // um disparo para cada oponente seu atacado
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const atacados = [...new Set(e.attackers.flatMap((a) => (a.target.kind === 'player' && c.g.isOpponent(c.you, a.target.id) ? [a.target.id] : [])))];
        return atacados.map((p) => ({ atacante: e.player, atacado: p }));
      }), function* (c) {
        yield* draw(c.g, c.event.atacante as PlayerId, 1);
        // ruling 1: escolhe a criatura na resolução; ruling 3: sem criatura, só a compra
        const minhas = creaturesOf(c.g, c.you);
        if (!minhas.length) return;
        const [id] = minhas.length === 1 ? [String(minhas[0])] : yield* chooseItems(c.g, c.you, 'Breena: escolha uma criatura sua para receber dois marcadores +1/+1', minhas.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        addCounters(c.g, { kind: 'obj', id: Number(id) }, '+1/+1', 2, c.you);
      }, {
        // "se" interveniente (CR 603.4): o atacado tem mais vida que outro oponente seu
        condition: (c) => {
          const atacado = c.event.atacado as PlayerId;
          const vida = c.g.state.players[atacado]?.life ?? 0;
          return c.g.opponents(c.you).some((p) => p !== atacado && c.g.state.players[p].life < vida);
        },
        text: 'Sempre que um jogador ataca um dos seus oponentes, se esse oponente tiver mais vida que outro oponente seu, o jogador atacante compra uma carta e você coloca dois marcadores +1/+1 numa criatura que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — escolhe a criatura na resolução',
    2: 'teste: um oponente atacando outro com mais vida também dispara',
    3: 'regra geral: o gatilho não depende de você controlar criaturas (o atacante compra de qualquer forma)',
  },
});
