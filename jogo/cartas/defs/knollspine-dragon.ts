// Knollspine Dragon
// Flying
// When this creature enters, you may discard your hand and draw cards equal to the damage dealt to target opponent this
// turn.
import { defineCard, discard, draw, etb, keyword, t, tgtPlayer, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Knollspine Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: o alvo é escolhido ao disparar; a decisão de descartar é na resolução
      etb(function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        // rulings 2-3: todo o dano causado a esse oponente no turno, de qualquer fonte; ganho de vida não muda a conta
        const n = c.g.state.turnStats[p]?.damageTaken ?? 0;
        if (!(yield* yesNo(c.g, c.you, `Knollspine Dragon: descartar a sua mão e comprar ${n} carta${n === 1 ? '' : 's'}?`))) return;
        const mao = c.g.state.zones.hand[c.you].length;
        if (mao > 0) yield* discard(c.g, c.you, mao);
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { targets: [t.opponent()], text: 'Quando esta criatura entra, você pode descartar a sua mão e comprar cartas iguais ao dano causado ao oponente alvo neste turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3d — o alvo é escolhido ao pôr o gatilho na pilha; a decisão é na resolução',
    2: 'teste: descarta a mão e compra cartas iguais ao dano causado ao oponente alvo no turno',
    3: 'regra geral: a conta é do dano causado (turnStats.damageTaken), não da diferença de vida (motor/actions.ts dealDamage)',
  },
});
