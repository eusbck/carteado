// Temple of the False God
// {T}: Add {C}{C}. Activate only if you control five or more lands.
import { controlledBy, defineCard, isLand, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Temple of the False God',
  faces: [{
    abilities: [
      mana('CC', { condition: (c) => controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 5, text: '{T}: Adicione {C}{C}. Ative só se você controla cinco ou mais terrenos.' }),
    ],
  }],
  rulings: {},
});
