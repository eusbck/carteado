// Skyclave Relic
// Kicker {3}
// Indestructible
// When this artifact enters, if it was kicked, create two tapped tokens that are copies of this artifact.
// {T}: Add one mana of any color.
import { additionalCost, copiableValues, createTokens, defineCard, etb, keyword, mana, paidTimes } from '../../motor/api.ts';

export default defineCard({
  name: 'Skyclave Relic',
  faces: [{
    // rulings 1-2 (CR 702.33a): custo adicional opcional, pago uma vez
    additionalCosts: [additionalCost('kicker', 'kicker {3}', [{ k: 'mana', cost: '{3}' }], { optional: true })],
    abilities: [
      keyword('indestructible'),
      etb(function* (c) {
        // ruling 5: as fichas são cópias do permanente e não foram reforçadas
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 2, { tapped: true });
      }, {
        // CR 603.4: cláusula "se" interveniente; ruling 3: posto no campo sem ser conjurado, não foi reforçado
        condition: (c) => paidTimes(c.g, c.source, 'kicker') > 0,
        text: 'Quando este artefato entra, se foi reforçado, crie duas fichas viradas que são cópias deste artefato.',
      }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'teste: reforçado, cria duas fichas viradas que são cópias dele; as fichas não criam outras',
    2: 'regra geral: CR 702.33a — o kicker é pago uma vez (motor/stack.ts castInner)',
    3: 'teste: posto no campo sem ser conjurado, ou conjurado sem reforçar, não cria fichas',
    4: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    5: 'teste: reforçado, cria duas fichas viradas que são cópias dele; as fichas não criam outras',
    6: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
  },
});
