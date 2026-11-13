// Mind Games
// Buyback {2}{U} (You may pay an additional {2}{U} as you cast this spell. If you do, put this card into your hand as it
// resolves.)
// Tap target artifact, creature, or land.
import { buyback, defineCard, tap, tgt } from '../../motor/api.ts';
import { alvoArtefatoCriaturaOuTerreno } from '../twitch.ts';

export default defineCard({
  name: 'Mind Games',
  faces: [{
    // CR 702.27a: pago, a carta volta para a mão do dono ao resolver (motor/stack.ts)
    additionalCosts: [buyback('{2}{U}')],
    spell: {
      targets: [alvoArtefatoCriaturaOuTerreno()],
      *effect(c) { const id = tgt(c); if (id !== null) tap(c.g, id); },
    },
  }],
  rulings: {},
});
