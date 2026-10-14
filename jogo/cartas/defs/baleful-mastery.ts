// Baleful Mastery
// You may pay {1}{B} rather than pay this spell's mana cost.
// If the {1}{B} cost was paid, an opponent draws a card.
// Exile target creature or planeswalker.
import { chooseItems, defineCard, draw, exile, t, tgt } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const ALT = 'mastery';

export default defineCard({
  name: 'Baleful Mastery',
  faces: [{
    // CR 118.9: custo alternativo
    altCosts: [{ key: ALT, label: 'Conjurar por {1}{B} (um oponente compra uma carta)', zone: 'hand', mana: '{1}{B}' }],
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const g = c.g;
        if (c.method === ALT) {
          // ruling 5: você escolhe o oponente na resolução
          const ops = g.opponents(c.you).filter((p) => !g.state.players[p].left);
          if (ops.length) {
            const quem = ops.length === 1 ? ops[0] : Number((yield* chooseItems(g, c.you, 'Baleful Mastery: qual oponente compra uma carta?', ops.map((p) => ({ id: String(p), label: g.state.players[p].name })), 1, 1))[0]) as PlayerId;
            yield* draw(g, quem, 1);
          }
        }
        const id = tgt(c);
        if (id !== null) yield* exile(g, [id]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — o valor de mana é o do custo impresso, qualquer que seja o custo pago',
    2: 'regra geral: CR 118.9a — só um custo alternativo por mágica (motor/stack.ts)',
    3: 'regra geral: CR 601.2f — aumentos e reduções valem sobre o custo alternativo, que continua pago (motor/stack.ts totalSpellCost)',
    4: 'regra geral: CR 707.10 — a cópia mantém o custo alternativo pago (motor/stack.ts copySpell)',
    5: 'teste: pelo custo de {1}{B}, você escolhe o oponente que compra uma carta',
  },
});
