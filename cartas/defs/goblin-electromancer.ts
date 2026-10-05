// Goblin Electromancer
// Instant and sorcery spells you cast cost {1} less to cast.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Goblin Electromancer',
  faces: [{
    abilities: [staticAbility({
      // rulings 2-3: reduz só a parte genérica do custo total (CR 601.2f)
      rules: { costModifier: (c, spell) => (spell.controller === c.you && (spell.chars.types.includes('Instant') || spell.chars.types.includes('Sorcery')) ? { reduce: 1 } : null) },
      text: 'As mágicas instantâneas e de feitiço que você conjura custam {1} a menos.',
    })],
  }],
  rulings: {
    1: 'teste: dois Electromancers reduzem {2}',
    2: 'regra geral: CR 601.2f — só mana genérica',
    3: 'regra geral: CR 601.2f — custo total; valor de mana inalterado',
  },
});
