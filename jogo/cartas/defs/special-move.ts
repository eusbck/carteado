// Special Move
// Choose two —
// • Jump Kick — Destroy target artifact.
// • Dash Attack — Put two +1/+1 counters on target attacking or blocking creature you control.
// • Foot Toss — Target creature you control deals damage equal to its power to any other target. Then sacrifice it.
import { addCounters, and, dealDamage, defineCard, destroy, is, isAttacking, modal, power, sacrifice, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Special Move',
  faces: [{
    spell: {
      modes: modal(2, 2, [
        {
          text: 'Jump Kick — Destrua o artefato alvo', targets: [t.artifact()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Dash Attack — Coloque dois marcadores +1/+1 na criatura atacante ou bloqueadora alvo que você controla',
          targets: [t.creature(and(is.yours, (c, id) => isAttacking(c.g, id) || !!c.g.state.combat?.blockers.some((b) => b.id === id)), 'criatura atacante ou bloqueadora alvo que você controla')],
          *effect(c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you); },
        },
        {
          text: 'Foot Toss — A criatura alvo que você controla causa dano igual à força dela a qualquer outro alvo; depois, sacrifique-a',
          targets: [t.creature(is.yours, 'criatura alvo que você controla (Foot Toss)'), { ...t.any('qualquer outro alvo'), differentFrom: [0] }],
          *effect(c) {
            const a = c.targets[0]?.[0];
            const b = c.targets[1]?.[0];
            if (!a || a.kind !== 'obj' || c.g.state.objects[a.id]?.zone !== 'battlefield') return;
            if (b) dealDamage(c.g, [{ source: a.id, target: b, amount: power(c.g, a.id), combat: false }]);
            yield* sacrifice(c.g, [a.id]);
          },
        },
      ]),
    },
  }],
  rulings: {},
});