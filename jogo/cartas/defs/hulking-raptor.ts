// Hulking Raptor
// Ward {2}
// At the beginning of your first main phase, add {G}{G}.
import { addMana, defineCard, on, triggered, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Hulking Raptor',
  faces: [{
    abilities: [
      ...ward('{2}'),
      triggered(on.firstMain(), function* (c) { addMana(c.g, c.you, ['G', 'G'], { source: c.source }); }, { text: 'No início da sua primeira fase principal, adicione {G}{G}.' }),
    ],
  }],
  rulings: {},
});
