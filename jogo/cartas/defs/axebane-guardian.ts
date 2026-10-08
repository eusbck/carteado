// Axebane Guardian
// Defender
// {T}: Add X mana in any combination of colors, where X is the number of creatures you control with defender.
import { controlledBy, defineCard, hasKw, isCreature, keyword, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Axebane Guardian',
  faces: [{
    abilities: [
      keyword('defender'),
      // '*' = cor escolhida ao ativar (cada mana pode ser de uma cor; ruling 1)
      mana((c) => {
        const x = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && hasKw(c.g, id, 'defender')).length;
        return x > 0 ? [Array<ManaType>(x).fill('*' as ManaType)] : [];
      }, { text: '{T}: Adicione X manas em qualquer combinação de cores, onde X é o número de criaturas com defensor que você controla.' }),
    ],
  }],
  rulings: { 1: 'teste: X conta as criaturas com defensor; as cores são escolhidas ao ativar' },
});
