// The Shire
// The Shire enters tapped unless you control a legendary creature.
// {T}: Add {G}.
// {1}{G}, {T}, Tap an untapped creature you control: Create a Food token.
import { activated, controlledBy, createTokens, defineCard, entersTapped, is, and, mana } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'The Shire',
  faces: [{
    abilities: [
      // ruling 4: a criatura lendária precisa já estar no campo quando o terreno entra
      entersTapped((c) => controlledBy(c.g, c.you, (id) => and(is.creature, is.legendary)(c, id)).length > 0),
      mana('G'),
      // virar a criatura é custo, não o símbolo {T} dela: vale com enjoo de invocação (CR 302.6 só fala de {T}/{Q})
      activated([{ k: 'mana', cost: '{1}{G}' }, { k: 'tap' }, { k: 'tapCreatures', n: 1 }], function* (c) {
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, { text: '{1}{G}, {T}, Vire uma criatura desvirada que você controla: Crie uma ficha Food.' }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.qualquer,
    3: COMIDA.naoComa,
    4: 'teste: entra virado sem criatura lendária; desvirado com uma já no campo',
  },
});
