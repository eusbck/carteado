// Cloud's Limit Break
// Tiered (Choose one additional cost.)
// • Cross-Slash — {0} — Destroy target tapped creature.
// • Blade Beam — {1} — Destroy any number of target tapped creatures with different controllers.
// • Omnislash — {3}{W} — Destroy all tapped creatures.
import { anyNumber, controllerOf, defineCard, destroy, is, isCreature, modal, t, tgt, tgtsAll } from '../../motor/api.ts';
import type { AdditionalCostDef } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

// CR 702.183a: escolha um modo e pague o custo adicional dele (pago sem pergunta: whenMode)
const tier = (key: string, label: string, cost: string, whenMode: number): AdditionalCostDef =>
  ({ key, label, optional: false, parts: [{ k: 'mana', cost }], whenMode });

export default defineCard({
  name: "Cloud's Limit Break",
  faces: [{
    additionalCosts: [tier('blade-beam', 'Blade Beam — {1}', '{1}', 1), tier('omnislash', 'Omnislash — {3}{W}', '{3}{W}', 2)],
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Cross-Slash — {0} — Destrua a criatura virada alvo',
          targets: [t.creature(is.tapped, 'criatura virada alvo')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Blade Beam — {1} — Destrua qualquer número de criaturas viradas alvo com controladores diferentes',
          targets: [{
            ...anyNumber(t.creature(is.tapped, 'criaturas viradas alvo com controladores diferentes')),
            validateSet: (c, alvos) => new Set(alvos.map((a) => controllerOf(c.g, a.id as ObjId))).size === alvos.length,
          }],
          *effect(c) { const ids = tgtsAll(c, 0); if (ids.length) yield* destroy(c.g, ids); },
        },
        {
          text: 'Omnislash — {3}{W} — Destrua todas as criaturas viradas',
          *effect(c) {
            const ids = c.g.state.zones.battlefield.filter((id) => isCreature(c.g, id) && c.g.state.objects[id].tapped);
            if (ids.length) yield* destroy(c.g, ids);
          },
        },
      ]),
      *effect() { /* o modo faz tudo */ },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.183a — sem pagar o custo de mana, ainda escolhe o modo e paga o custo adicional dele (motor/stack.ts whenMode)',
    2: 'regra geral: CR 700.2 — o modo é escolhido ao conjurar e não muda (motor/stack.ts)',
    3: 'regra geral: CR 700.2a — só dá para escolher o modo com alvo se houver alvo legal (motor/stack.ts)',
    4: 'regra geral: CR 202.3 — o valor de mana é o do custo impresso ({1}{W}) (motor/chars.ts)',
    5: 'teste: Omnislash custa {1}{W} + {3}{W} e destrói todas as criaturas viradas',
    6: 'regra geral: CR 707.10 — a cópia mantém o modo; só os alvos podem mudar (motor/copias)',
  },
});
