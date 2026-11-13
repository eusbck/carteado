// Miscast
// Counter target instant or sorcery spell unless its controller pays {3}.
import { defineCard, is, t, tgt } from '../../motor/api.ts';
import { anulaAMenosQuePague } from '../naoanula.ts';

export default defineCard({
  name: 'Miscast',
  faces: [{
    spell: {
      targets: [t.spell(is.instantOrSorcery, 'mágica instantânea ou de feitiço alvo')],
      *effect(c) {
        const id = tgt(c);
        // CR 118.12a: o controlador da mágica pode pagar {3}
        if (id !== null) yield* anulaAMenosQuePague(c, id, '{3}', 'Miscast');
      },
    },
  }],
  rulings: {},
});
