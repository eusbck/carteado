// Necrotic Hex
// Each player sacrifices six creatures of their choice. You create six tapped 2/2 black Zombie creature tokens.
import { createTokens, defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Necrotic Hex',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: cada jogador escolhe em ordem APNAP (CR 101.4), depois todos sacrificam ao mesmo tempo
        yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), 6, 'seis criaturas');
        // ruling 2: as seis fichas, não importa quantas foram sacrificadas
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 6, { tapped: true });
      },
    },
  }],
  rulings: {
    1: 'teste: CR 101.4: cada jogador escolhe em ordem APNAP e todos sacrificam juntos; depois as fichas',
    2: 'teste: seis fichas viradas mesmo sem nada para sacrificar',
  },
});
