// Ilysian Caryatid
// {T}: Add one mana of any color. If you control a creature with power 4 or greater, add two mana of any one color
// instead.
import { defineCard, mana, type ManaType } from '../../motor/api.ts';
import { temForca4 } from '../dinossauros.ts';

const CORES: ManaType[] = ['W', 'U', 'B', 'R', 'G'];

export default defineCard({
  name: 'Ilysian Caryatid',
  faces: [{
    abilities: [
      mana((c) => (temForca4(c.g, c.you) ? CORES.map((x) => [x, x]) : CORES.map((x) => [x])), {
        text: '{T}: Adicione uma mana de qualquer cor. Se você controla uma criatura com força 4 ou mais, adicione duas manas de qualquer uma cor em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 605.3b — habilidade de mana não usa a pilha e não pode ser respondida (motor/costs.ts)',
  },
});
