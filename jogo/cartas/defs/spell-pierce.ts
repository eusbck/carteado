// Spell Pierce
// Counter target noncreature spell unless its controller pays {2}.
import { defineCard, is, not, t, tgt } from '../../motor/api.ts';
import { anulaAMenosQuePague } from '../naoanula.ts';

export default defineCard({
  name: 'Spell Pierce',
  faces: [{
    spell: {
      targets: [t.spell(not(is.creature), 'mágica não criatura alvo')],
      *effect(c) {
        const id = tgt(c);
        // CR 118.12a: o controlador da mágica pode pagar {2}
        if (id !== null) yield* anulaAMenosQuePague(c, id, '{2}', 'Spell Pierce');
      },
    },
  }],
  rulings: {},
});
