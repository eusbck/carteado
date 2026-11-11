// Ganax, Astral Hunter
// Flying
// Whenever Ganax or another Dragon you control enters, create a Treasure token. (It's an artifact with "{T},
// Sacrifice this token: Add one mana of any color.")
// Choose a Background (You can have a Background as a second commander.)
import { controllerOf, createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { ehDragao } from '../dragoes.ts';

export default defineCard({
  name: 'Ganax, Astral Hunter',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.enters((c, id) => id === c.source || (ehDragao(c.g, id) && controllerOf(c.g, id) === c.you)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que Ganax ou outro Dragon que você controla entra, crie uma ficha de Tesouro.' }),
      // "escolha um Antecedente" só vale na montagem do deck (CR 702.124i); aqui Ganax não é comandante
      keyword('choose a background'),
    ],
  }],
  rulings: {
    1: 'não se aplica: Ganax não é comandante neste deck (Escolha um Antecedente só vale na montagem do deck)',
    2: 'não se aplica: Ganax não é comandante neste deck',
    3: 'não se aplica: Ganax não é comandante neste deck',
    4: 'não se aplica: Ganax não é comandante neste deck',
    5: 'não se aplica: Ganax não é comandante neste deck',
    6: 'não se aplica: Ganax não é comandante neste deck',
    7: 'não se aplica: Ganax não é comandante neste deck',
    8: 'não se aplica: Ganax não é comandante neste deck',
    9: 'não se aplica: Ganax não é comandante neste deck',
    10: 'não se aplica: Ganax não é comandante neste deck',
  },
});
