// Blasphemous Act
// This spell costs {1} less to cast for each creature on the battlefield.
// Blasphemous Act deals 13 damage to each creature.
import { allCreatures, dealDamage, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Blasphemous Act',
  faces: [{
    // rulings 1-4: o custo total é travado antes de pagar; a redução só tira genérico (CR 601.2f)
    selfCost: (c) => ({ reduce: allCreatures(c.g).length }),
    spell: {
      *effect(c) {
        dealDamage(c.g, allCreatures(c.g).map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 13, combat: false })));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — o custo é travado antes da ativação de mana',
    2: 'regra geral: CR 601.2f — aumentos antes das reduções; valor de mana não muda',
    3: 'regra geral: CR 601.2 — sem respostas durante a conjuração',
    4: 'teste: a redução não tira o {R}',
  },
});
