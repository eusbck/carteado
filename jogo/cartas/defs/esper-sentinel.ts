// Esper Sentinel
// Whenever an opponent casts their first noncreature spell each turn, draw a card unless that player pays {X}, where X
// is this creature's power.
import { defineCard, draw, lkiChars, mayPay, on, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Esper Sentinel',
  faces: [{
    abilities: [
      // ruling 1: a contagem do turno inclui as mágicas conjuradas antes de a Sentinela entrar (o contador é do jogo)
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || !c.g.isOpponent(c.you, e.player)) return false;
        const o = c.g.state.objects[e.obj];
        if (!o || lkiChars(c.g, e.obj)?.types.includes('Creature')) return false;
        return (c.g.state.turnStats[e.player]?.noncreatureSpellsCast ?? 0) === 1 ? { jogador: e.player } : false;
      }), function* (c) {
        const quem = c.event.jogador as PlayerId;
        // ruling 2: a força é vista na resolução (ou a última conhecida); ruling 3: força negativa vale {0}
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        // CR 118.12a: "a menos que pague" = o jogador pode pagar; se não pagar, você compra
        const rotulo = `que ${c.g.state.players[c.you].name} não compre uma carta (Esper Sentinel)`;
        if (!c.g.state.players[quem].left) {
          const pagou = x === 0 ? yield* yesNo(c.g, quem, `Pagar {0} para ${rotulo}?`) : yield* mayPay(c, quem, `{${x}}`, rotulo);
          if (pagou) return;
        }
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente conjura a primeira mágica que não é de criatura dele em cada turno, compre uma carta a menos que esse jogador pague {X}, onde X é a força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: com uma mágica não criatura já conjurada no turno, não dispara',
    2: 'teste: a força é vista na resolução; fora do campo, vale a última conhecida',
    3: 'teste: com força negativa, X é 0 e o oponente ainda pode não pagar',
  },
});
