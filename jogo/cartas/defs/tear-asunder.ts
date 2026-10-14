// Tear Asunder
// Kicker {1}{B} (You may pay an additional {1}{B} as you cast this spell.)
// Exile target artifact or enchantment. If this spell was kicked, exile target nonland permanent instead.
import { additionalCost, defineCard, exile, is, or, paidTimes, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const reforcada = (c: SCtx): boolean => paidTimes(c.g, c.source, 'kicker') > 0;

export default defineCard({
  name: 'Tear Asunder',
  faces: [{
    // CR 702.33a: custo adicional opcional, pago uma vez
    additionalCosts: [additionalCost('kicker', 'kicker {1}{B}', [{ k: 'mana', cost: '{1}{B}' }], { optional: true })],
    spell: {
      // ruling 1: reforçada, o alvo pode ser qualquer permanente não terreno (o alvo muda conforme o kicker, CR 601.2c)
      targets: [
        { ...t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo'), min: 0, max: (c) => (reforcada(c) ? 0 : 1), validateSet: (c, alvos) => reforcada(c) || alvos.length === 1 },
        { ...t.nonlandPermanent(undefined, 'permanente não terreno alvo (reforçada)'), min: 0, max: (c) => (reforcada(c) ? 1 : 0), validateSet: (c, alvos) => !reforcada(c) || alvos.length === 1 },
      ],
      *effect(c) {
        const id = c.paid.kicker ? tgt(c, 1) : tgt(c, 0);
        if (id !== null) yield* exile(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'teste: reforçada, exila uma criatura; sem reforço, só artefato ou encantamento',
  },
});
