// Defile
// Target creature gets -1/-1 until end of turn for each Swamp you control.
import { controllerOf, defineCard, isSubtype, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Defile',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        const n = c.g.state.zones.battlefield.filter((x) => controllerOf(c.g, x) === c.you && isSubtype(c.g, x, 'Swamp')).length;
        if (id !== null && n > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: -n, t: -n }]);
      },
    },
  }],
  rulings: {},
});