// Elanor Gardner
// When Elanor enters, create a Food token.
// At the beginning of your end step, if you sacrificed a Food this turn, you may search your library for a basic land
// card, put that card onto the battlefield tapped, then shuffle.
import { createTokens, defineCard, etb, maySearchBasicToBattlefield, on, triggered } from '../../motor/api.ts';
import { sacrificouFoodNoTurno } from '../condado.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Elanor Gardner',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Food', 1); }, { text: 'Quando Elanor entra, crie uma ficha Food.' }),
      // CR 603.4: "se" interveniente; a contagem é do turno inteiro, mesmo antes de Elanor entrar (ruling 5)
      triggered(on.endStep('you'), function* (c) {
        yield* maySearchBasicToBattlefield(c, c.you, true);
      }, {
        condition: (c) => sacrificouFoodNoTurno(c.g, c.you),
        text: 'No início da sua etapa final, se você sacrificou uma Food neste turno, você pode procurar no seu grimório uma carta de terreno básico, colocá-la no campo de batalha virada e depois embaralhar.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
    5: 'teste: a Food sacrificada antes de Elanor entrar conta; na etapa final, busca um terreno básico virado',
    6: 'teste: sem Food sacrificada no turno, não dispara',
  },
});
