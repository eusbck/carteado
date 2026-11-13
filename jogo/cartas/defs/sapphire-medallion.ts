// Sapphire Medallion
// Blue spells you cast cost {1} less to cast.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Sapphire Medallion',
  faces: [{
    abilities: [
      // CR 601.2f: a redução vem depois dos aumentos e só tira mana genérica; vale para custos alternativos
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.colors.includes('U') ? { reduce: 1 } : null) },
        text: 'As mágicas azuis que você conjura custam {1} a menos para serem conjuradas.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — a redução muda só o custo total, não o valor de mana (motor/stack.ts totalSpellCost)',
    2: 'teste: não reduz mana colorida: Counterspell continua custando {U}{U}',
    3: 'regra geral: CR 601.2f — aumentos antes das reduções (motor/stack.ts totalSpellCost)',
    4: 'teste: reduz o custo de retrospectiva de uma mágica azul',
    5: 'regra geral: CR 601.2f — o X é escolhido antes de calcular o custo total (motor/stack.ts castSpell)',
  },
});
