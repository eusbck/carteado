// Collective Effort
// Escalate—Tap an untapped creature you control. (Pay this cost for each mode chosen beyond the first.)
// Choose one or more —
// • Destroy target creature with power 4 or greater.
// • Destroy target enchantment.
// • Put a +1/+1 counter on each creature target player controls.
import { addCounters, creaturesOf, defineCard, destroy, escalate, modal, power, t, tgt, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Collective Effort',
  faces: [{
    // CR 702.120a: vire uma criatura desvirada sua para cada modo além do primeiro (ruling 4: vale criatura com enjoo)
    additionalCosts: [escalate([{ k: 'tapCreatures', n: 1, label: 'uma criatura desvirada que você controla' }], 'vire uma criatura desvirada que você controla')],
    spell: {
      // ruling 8: cada modo no máximo uma vez
      modes: modal(1, 3, [
        {
          text: 'Destrua a criatura alvo com força 4 ou mais',
          targets: [t.creature((c, id) => power(c.g, id) >= 4, 'criatura alvo com força 4 ou mais')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Destrua o encantamento alvo',
          targets: [t.enchantment()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'Coloque um marcador +1/+1 em cada criatura que o jogador alvo controla',
          targets: [t.player()],
          *effect(c) {
            const p = tgtPlayer(c, 0);
            if (p === null) return;
            for (const id of creaturesOf(c.g, p)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
          },
        },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — custos adicionais não mudam o valor de mana (motor/chars.ts)',
    2: 'regra geral: CR 601.2b — todos os modos são escolhidos ao conjurar (motor/stack.ts castInner)',
    3: 'regra geral: CR 601.2f — as reduções valem sobre o custo total (motor/stack.ts totalSpellCost)',
    4: 'teste: CR 702.120a: com três modos, vira duas criaturas (mesmo com enjoo) e faz os três efeitos em ordem',
    5: 'regra geral: CR 702.120a — a escalada é paga mesmo sem pagar o custo de mana (motor/stack.ts castInner)',
    6: 'regra geral: CR 700.2 — os alvos de cada modo são escolhidos separadamente e podem coincidir (motor/stack.ts)',
    7: 'não se aplica: nenhum deck da mesa tem efeito de "exile até" que acabe com a destruição',
    8: 'teste: um modo só não cobra a escalada',
    9: 'regra geral: CR 608.2b — com um alvo ilegal, os outros modos ainda acontecem (motor/stack.ts)',
  },
});
