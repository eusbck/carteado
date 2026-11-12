// Greensleeves, Maro-Sorcerer
// Protection from planeswalkers and from Wizards
// Greensleeves's power and toughness are each equal to the number of lands you control.
// Landfall — Whenever a land you control enters, create a 3/3 green Badger creature token.
import { createTokens, defineCard, keyword, on, selfGets, triggered } from '../../motor/api.ts';
import { ATERRAGEM, terrenosDe } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Greensleeves, Maro-Sorcerer',
  faces: [{
    abilities: [
      // CR 702.16a: proteção contra um tipo de carta e contra um subtipo
      keyword('protection', 'type:Planeswalker'),
      keyword('protection', 'subtype:Wizard'),
      // CR 604.3: habilidade que define característica, vale em todas as zonas (ruling 4)
      selfGets((c) => { const n = terrenosDe(c.g, c.you).length; return [{ k: 'setPT', p: n, t: n }]; },
        'A força e a resistência de Greensleeves são iguais ao número de terrenos que você controla.', { cda: true }),
      triggered(on.landfall(), function* (c) {
        yield* createTokens(c.g, c.you, 'Badger', 1);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, crie uma ficha de criatura Texugo 3/3 verde.' }),
    ],
  }],
  rulings: {
    ...ATERRAGEM('teste: jogando um terreno, cria um Badger 3/3 e Greensleeves cresce'),
    4: 'teste: vale também fora do campo',
  },
});
