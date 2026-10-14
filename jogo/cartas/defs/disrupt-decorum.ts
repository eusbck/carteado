// Disrupt Decorum
// Goad all creatures you don't control. (Until your next turn, those creatures attack each combat if able and attack a
// player other than you if able.)
import { allCreatures, controllerOf, defineCard, goad } from '../../motor/api.ts';
import { GOAD } from '../culpa.ts';

export default defineCard({
  name: 'Disrupt Decorum',
  faces: [{
    spell: {
      *effect(c) {
        for (const id of allCreatures(c.g)) if (controllerOf(c.g, id) !== c.you) goad(c.g, id, c.you);
      },
    },
  }],
  rulings: {
    1: GOAD.excecoes,
    2: GOAD.outroJogador,
    3: GOAD.naoEHabilidade,
    4: GOAD.continua,
    5: GOAD.varios,
    6: 'teste: goada as criaturas que você não controla; as suas e as que entram depois ficam de fora',
  },
});
