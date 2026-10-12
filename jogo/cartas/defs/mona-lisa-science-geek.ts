// Mona Lisa, Science Geek
// Reach
// {T}: Add X mana of any one color, where X is Mona Lisa's power.
import { defineCard, keyword, mana, power } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Mona Lisa, Science Geek',
  faces: [{
    abilities: [
      keyword('reach'),
      mana((c) => {
        const x = power(c.g, c.source);
        if (x <= 0) return [];
        return (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array(x).fill(cor) as ManaType[]);
      }, { text: '{T}: Adicione X manas de uma cor qualquer, sendo X a força de Mona Lisa.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 605.3b — habilidade de mana não usa a pilha e não pode ser respondida (motor/priority.ts)' },
});