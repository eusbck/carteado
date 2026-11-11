// Battle of Wolf 359
// All nonartifact creatures get -X/-X until end of turn, where X is the number of artifact creatures you control.
import { allCreatures, chars, controlledBy, defineCard, untilEndOfTurn } from '../../motor/api.ts';
import { criaturaArtefato } from '../borg.ts';

export default defineCard({
  name: 'Battle of Wolf 359',
  faces: [{
    spell: {
      *effect(c) {
        // X é fixado na resolução (CR 608.2h) e as afetadas são as de agora (CR 611.2c)
        const x = controlledBy(c.g, c.you, (id) => criaturaArtefato(c, id)).length;
        if (x <= 0) return;
        untilEndOfTurn(c, allCreatures(c.g).filter((id) => !chars(c.g, id).types.includes('Artifact')), [{ k: 'pt', p: -x, t: -x }]);
      },
    },
  }],
  rulings: {},
});
