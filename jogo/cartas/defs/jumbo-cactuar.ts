// Jumbo Cactuar
// 10,000 Needles — Whenever this creature attacks, it gets +9999/+0 until end of turn.
import { defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Jumbo Cactuar',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 9999, t: 0 }]);
      }, { text: '10.000 Agulhas — Sempre que esta criatura ataca, ela recebe +9999/+0 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
