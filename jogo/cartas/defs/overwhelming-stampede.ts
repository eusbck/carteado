// Overwhelming Stampede
// Until end of turn, creatures you control gain trample and get +X/+X, where X is the greatest power among creatures you
// control.
import { creaturesOf, defineCard, power, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Overwhelming Stampede',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: a maior força é vista na resolução, uma vez
        const ids = creaturesOf(c.g, c.you);
        if (!ids.length) return;
        const x = Math.max(0, ...ids.map((id) => power(c.g, id)));
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'trample' }, { k: 'pt', p: x, t: x }]);
      },
    },
  }],
  rulings: {
    1: 'teste: as suas criaturas ganham atropelar e +X/+X, com X igual à maior força entre elas',
  },
});