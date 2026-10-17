// Sephara, Sky's Blade
// You may pay {W} and tap four untapped creatures you control with flying rather than pay this spell's mana cost.
// Flying, lifelink
// Other creatures you control with flying have indestructible. (Damage and effects that say "destroy" don't destroy
// them.)
import { and, anthem, defineCard, hasKw, is, keywords } from '../../motor/api.ts';

export default defineCard({
  name: "Sephara, Sky's Blade",
  faces: [{
    // CR 118.9: custo alternativo; ruling 1: vale virar criaturas que acabaram de entrar
    altCosts: [{
      key: 'sephara', label: 'Conjurar por {W} virando quatro criaturas com voar', zone: 'hand', mana: '{W}',
      parts: [{ k: 'tapCreatures', n: 4, filter: (c, id) => hasKw(c.g, id, 'flying'), label: 'criatura(s) desvirada(s) com voar' }],
    }],
    abilities: [
      ...keywords('flying', 'lifelink'),
      anthem(and(is.creature, is.yours, is.other, is.kw('flying')), () => [{ k: 'addKeyword', kw: 'indestructible' }], 'As outras criaturas com voar que você controla têm indestrutível.'),
    ],
  }],
  rulings: {
    1: 'teste: pelo custo alternativo, vira quatro criaturas suas com voar, mesmo as que acabaram de entrar',
    2: 'regra geral: CR 601.2f — o custo total parte do custo alternativo; o valor de mana não muda (motor/stack.ts)',
    3: 'regra geral: CR 704.5g — o dano fica marcado até a limpeza; sem Sephara, pode virar letal (motor/sba.ts)',
  },
});
