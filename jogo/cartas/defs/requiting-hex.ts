// Requiting Hex
// As an additional cost to cast this spell, you may blight 1. (You may put a -1/-1 counter on a creature you control.)
// Destroy target creature with mana value 2 or less. If this spell's additional cost was paid, you gain 2 life.
import { additionalCost, defineCard, destroy, gainLife, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Requiting Hex',
  faces: [{
    additionalCosts: [additionalCost('blight', 'definhar 1 (coloque um marcador -1/-1 numa criatura sua)', [{ k: 'blight', n: 1 }], { optional: true })],
    spell: {
      targets: [t.creature(is.mvAtMost(2), 'criatura alvo com valor de mana 2 ou menos')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        if (c.paid.blight) gainLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — X é zero fora da pilha (manaValue)',
    2: 'teste: pode definhar uma criatura 1/1 que morre antes da mágica resolver',
    3: 'regra geral: CR 704.8 — as ações baseadas no estado usam as informações anteriores ao lote (motor/sba.ts)',
    4: 'regra geral: CR 601.2h-i — não há prioridade durante o pagamento dos custos',
    5: 'teste: paga o custo com uma única criatura e ganha 2 de vida',
    6: 'teste: CR 608.2b: com alvo ilegal, não destrói nem ganha vida mesmo pagando o custo',
    7: 'teste: marcadores +1/+1 e -1/-1 se anulam depois do pagamento',
    8: 'teste: sem criatura sua só oferece a conjuração sem definhar',
  },
});
