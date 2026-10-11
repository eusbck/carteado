// Growing Ranks
// At the beginning of your upkeep, populate. (Create a token that's a copy of a creature token you control.)
import { defineCard, on, populate, triggered } from '../../motor/api.ts';
import { POPULAR } from '../miku.ts';

export default defineCard({
  name: 'Growing Ranks',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) { yield* populate(c.g, c.you); }, { text: 'No início da sua manutenção, popule. (Crie uma ficha que é uma cópia de uma ficha de criatura que você controla.)' }),
    ],
  }],
  rulings: {
    1: POPULAR.naoMira,
    2: POPULAR.copiaDeCopia,
    3: POPULAR.copia,
    4: 'teste: a ficha nova não copia os marcadores da original',
    5: POPULAR.entrar,
    6: 'teste: sem ficha de criatura, popular não faz nada',
  },
});