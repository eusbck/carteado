// Overgrown Battlement
// Defender
// {T}: Add {G} for each creature you control with defender.
import { controlledBy, defineCard, hasKw, isCreature, keyword, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Overgrown Battlement',
  faces: [{
    abilities: [
      keyword('defender'),
      mana((c) => {
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && hasKw(c.g, id, 'defender')).length;
        return n > 0 ? [Array(n).fill('G') as ManaType[]] : [];
      }, { text: '{T}: Adicione {G} para cada criatura com defensor que você controla.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 605.3a — habilidade de mana não usa a pilha' },
});
