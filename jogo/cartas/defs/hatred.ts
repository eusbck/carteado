// Hatred
// As an additional cost to cast this spell, pay X life.
// Target creature gets +X/+0 until end of turn.
import { additionalCost, defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Hatred',
  faces: [{
    // ruling 1: a vida é custo, paga ao conjurar: perde-se mesmo que a mágica seja anulada
    additionalCosts: [additionalCost('life', 'pagar X de vida', [{ k: 'life', n: 'X' }])],
    spell: {
      xMax: (c) => Math.max(0, c.g.state.players[c.you].life),
      targets: [t.creature()],
      *effect(c) { const id = tgt(c); if (id !== null && c.x > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: c.x, t: 0 }]); },
    },
  }],
  rulings: { 1: 'teste: paga X de vida ao conjurar; a criatura alvo recebe +X/+0 até o fim do turno' },
});