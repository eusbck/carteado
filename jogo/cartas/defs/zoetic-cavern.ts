// Zoetic Cavern
// {T}: Add {C}.
// Morph {2} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)
import { defineCard, mana, morph } from '../../motor/api.ts';

export default defineCard({
  name: 'Zoetic Cavern',
  faces: [{
    abilities: [
      mana('C'),
      // CR 702.37a, 708.4: um terreno com morph pode ser conjurado virado para baixo como mágica de criatura 2/2
      morph('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: virada para cima, continua com os marcadores e vira terreno',
    2: 'não se aplica: Blood Moon não está nos decks',
  },
});
