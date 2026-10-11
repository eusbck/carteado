// Orim's Thunder
// Kicker {R} (You may pay an additional {R} as you cast this spell.)
// Destroy target artifact or enchantment. If this spell was kicked, it deals damage equal to that permanent's mana value
// to target creature.
import { additionalCost, candidateTargets, dealDamage, defineCard, destroy, is, manaValue, or, paidTimes, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Orim's Thunder",
  faces: [{
    // rulings 4-5 (CR 702.33a): custo adicional opcional, pago uma vez
    additionalCosts: [additionalCost('kicker', 'kicker {R}', [{ k: 'mana', cost: '{R}' }], { optional: true })],
    spell: {
      targets: [
        t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo'),
        // a criatura só é alvo se a mágica foi reforçada; reforçada, o alvo é obrigatório se houver criatura para mirar
        {
          ...t.creature(undefined, 'criatura alvo (se reforçada)'), min: 0, max: (c) => (paidTimes(c.g, c.source, 'kicker') > 0 ? 1 : 0),
          validateSet: (c, alvos) => paidTimes(c.g, c.source, 'kicker') === 0 || alvos.length === 1 || candidateTargets(c.g, t.creature(), c.you, c.source).length === 0,
        },
      ],
      *effect(c) {
        const id = tgt(c, 0);
        // ruling 7: sem o artefato ou encantamento não há valor de mana, e a criatura não leva dano
        if (id === null) return;
        const valor = manaValue(c.g, id);
        yield* destroy(c.g, [id]);
        const criatura = c.paid.kicker ? tgt(c, 1) : null;
        // ruling 8: a fonte do dano é Orim's Thunder
        if (criatura !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id: criatura }, amount: valor, combat: false }]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
    2: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    3: 'não se aplica: Orim\'s Thunder não é permanente',
    4: 'teste: reforçada, também causa à criatura alvo dano igual ao valor de mana da permanente destruída',
    5: 'regra geral: CR 702.33a — o kicker é pago uma vez (motor/stack.ts castInner)',
    6: 'não se aplica: Orim\'s Thunder não é permanente',
    7: 'regra geral: CR 608.2b — com o primeiro alvo ilegal, nada é destruído e não há valor de mana para o dano (cartas/defs/orims-thunder.ts)',
    8: 'teste: reforçada, também causa à criatura alvo dano igual ao valor de mana da permanente destruída',
  },
});