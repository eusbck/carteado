// Everflowing Chalice
// Multikicker {2} (You may pay an additional {2} any number of times as you cast this spell.)
// This artifact enters with a charge counter on it for each time it was kicked.
// {T}: Add {C} for each charge counter on this artifact.
import { defineCard, entersWithCounters, mana, multikicker } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Everflowing Chalice',
  faces: [{
    // CR 702.33c: custo adicional que pode ser pago quantas vezes quiser
    additionalCosts: [multikicker('{2}')],
    abilities: [
      // rulings 2 e 5 (CR 702.33d): só a mágica conjurada foi reforçada; posta no campo de outro jeito, entra sem marcadores
      entersWithCounters('charge', (_c, ev) => Number(ev.spell?.paid.multikicker ?? 0)),
      // ruling 7: sem marcadores, não gera mana
      mana((c) => {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        return n > 0 ? [Array<ManaType>(n).fill('C')] : [];
      }, { text: '{T}: Adicione {C} para cada marcador de carga neste artefato.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    2: 'teste: posto no campo sem ser conjurado, entra sem marcadores e não gera mana',
    3: 'regra geral: CR 702.33c — só o multikicker pode ser pago mais de uma vez (motor/conjurar-alternativo.ts multikicker)',
    4: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
    5: 'teste: posto no campo sem ser conjurado, entra sem marcadores e não gera mana',
    6: 'teste: CR 702.33c: com o multikicker pago duas vezes, entra com dois marcadores de carga e gera {C}{C}',
    7: 'teste: conjurado sem reforçar, custa {0}, entra sem marcadores e não gera mana',
  },
});
