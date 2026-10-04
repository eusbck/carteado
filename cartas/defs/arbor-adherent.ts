// Arbor Adherent
// {T}: Add one mana of any color.
// {T}: Add X mana of any one color, where X is the greatest toughness among other creatures you control.
import { controlledBy, defineCard, isCreature, mana, toughness } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Arbor Adherent',
  faces: [{
    abilities: [
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
      mana((c) => {
        const outras = controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id));
        const x = Math.max(0, ...outras.map((id) => toughness(c.g, id)));
        if (x <= 0) return [];
        return (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array(x).fill(cor) as ManaType[]);
      }, { text: '{T}: Adicione X manas de uma cor qualquer, onde X é a maior resistência entre outras criaturas que você controla.' }),
    ],
  }],
  rulings: {},
});
