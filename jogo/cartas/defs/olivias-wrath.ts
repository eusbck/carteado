// Olivia's Wrath
// Each non-Vampire creature gets -X/-X until end of turn, where X is the number of Vampires you control.
import { allCreatures, controlledBy, defineCard, isSubtype, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Olivia's Wrath",
  faces: [{
    spell: {
      *effect(c) {
        // X e as criaturas afetadas são fixados na resolução (CR 611.2c)
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Vampire')).length;
        const ids = allCreatures(c.g).filter((id) => !isSubtype(c.g, id, 'Vampire'));
        if (x > 0 && ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: -x, t: -x }]);
      },
    },
  }],
  rulings: {},
});
