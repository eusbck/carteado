// Command Chair
// This artifact enters tapped.
// {T}: Add three mana of any one color.
// {T}: Add X mana of any one color, where X is the greatest mana value among commanders you control.
import { controlledBy, defineCard, entersTapped, mana, manaValue } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { ehComandante } from '../vingadores.ts';

const CORES: ManaType[] = ['W', 'U', 'B', 'R', 'G'];

export default defineCard({
  name: 'Command Chair',
  faces: [{
    abilities: [
      entersTapped(),
      mana(['WWW', 'UUU', 'BBB', 'RRR', 'GGG'], { text: '{T}: Adicione três manas de uma mesma cor qualquer.' }),
      mana((c) => {
        const x = Math.max(0, ...controlledBy(c.g, c.you, (id) => ehComandante(c.g, id)).map((id) => manaValue(c.g, id)));
        return x > 0 ? CORES.map((k) => Array(x).fill(k) as ManaType[]) : [];
      }, { text: '{T}: Adicione X manas de uma mesma cor qualquer, em que X é o maior valor de mana entre os comandantes que você controla.' }),
    ],
  }],
  rulings: {},
});
