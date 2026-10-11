// Song of the Worldsoul
// Whenever you cast a spell, populate. (Create a token that's a copy of a creature token you control.)
import { defineCard, on, populate, triggered } from '../../motor/api.ts';
import { POPULAR } from '../miku.ts';

export default defineCard({
  name: 'Song of the Worldsoul',
  faces: [{
    abilities: [
      // ruling 7: resolve antes da mágica que a disparou, mesmo que ela seja anulada
      triggered(on.youCast(), function* (c) { yield* populate(c.g, c.you); }, { text: 'Sempre que você conjura uma mágica, popule. (Crie uma ficha que é uma cópia de uma ficha de criatura que você controla.)' }),
    ],
  }],
  rulings: {
    1: POPULAR.semFicha,
    2: POPULAR.semEstado,
    3: POPULAR.entrar,
    4: POPULAR.copia,
    5: POPULAR.copiaDeCopia,
    6: POPULAR.naoMira,
    7: 'teste: conjurando uma mágica, você popula antes de ela resolver',
  },
});