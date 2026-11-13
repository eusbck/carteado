// Innocent Blood
// Each player sacrifices a creature of their choice.
import { defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Innocent Blood',
  faces: [{
    spell: {
      *effect(c) {
        // CR 101.4: escolhas em ordem APNAP, sacrificadas ao mesmo tempo; ruling 1: quem não tem criatura não faz nada
        yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), 1, 'uma criatura');
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador sacrifica uma criatura; quem não tem criatura não é afetado',
  },
});
