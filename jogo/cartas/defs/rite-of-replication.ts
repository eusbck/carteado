// Rite of Replication
// Kicker {5} (You may pay an additional {5} as you cast this spell.)
// Create a token that's a copy of target creature. If this spell was kicked, create five of those tokens instead.
import { additionalCost, copiableValues, createTokens, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Rite of Replication',
  faces: [{
    // rulings 1, 2, 10: kicker é custo adicional opcional pago uma vez (CR 702.33)
    additionalCosts: [additionalCost('kicker', 'kicker {5}', [{ k: 'mana', cost: '{5}' }], { optional: true })],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, c.paid.kicker ? 5 : 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.33d — com o custo pago, a mágica está com kicker',
    2: 'regra geral: CR 702.33c — kicker se paga uma vez',
    3: 'regra geral: CR 702.33d — cópias de permanentes não ficam com kicker',
    4: 'regra geral: CR 707.10 — a cópia da mágica copia o kicker pago',
    5: 'regra geral: CR 601.2f — custo total',
    6: 'regra geral: CR 702.33a — sem conjurar, sem kicker',
    7: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    8: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    9: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    10: 'teste: com kicker, cinco fichas',
    11: 'regra geral: CR 707.5 — as fichas disparam as próprias habilidades de entrar',
    12: 'regra geral: CR 707.9 — X vale 0',
  },
});
