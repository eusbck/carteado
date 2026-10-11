// Oni of Wild Places
// Haste
// At the beginning of your upkeep, return a red creature you control to its owner's hand.
import { chars, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { devolveCriatura } from '../gatos.ts';

export default defineCard({
  name: 'Oni of Wild Places',
  faces: [{
    abilities: [
      keyword('haste'),
      // obrigatório: se ela for a única criatura vermelha, volta ela mesma
      triggered(on.upkeep('you'), function* (c) {
        yield* devolveCriatura(c, 'Oni of Wild Places: devolva uma criatura vermelha que você controla para a mão do dono', (id) => chars(c.g, id).colors.includes('R'));
      }, { text: 'No início da sua manutenção, devolva uma criatura vermelha que você controla para a mão do dono.' }),
    ],
  }],
  rulings: {},
});