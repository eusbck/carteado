// Riveteers Overlook
// When this land enters, sacrifice it. When you do, search your library for a basic Swamp, Mountain, or Forest
// card, put it onto the battlefield tapped, then shuffle and you gain 1 life.
import { chars, defineAbility, defineCard, etb, fetchBasicToBattlefield, gainLife, reflexive, sacrifice, type TriggeredDef } from '../../motor/api.ts';

// CR 603.12: gatilho reflexivo
const busca = defineAbility<TriggeredDef>('Riveteers Overlook:busca', {
  kind: 'triggered', on: { kind: 'batch', match: () => false },
  text: 'Procure uma Swamp, Mountain ou Forest básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.',
  *effect(c) {
    yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => s === 'Swamp' || s === 'Mountain' || s === 'Forest'), prompt: 'Procure uma carta de Swamp, Mountain ou Forest básico' });
    gainLife(c.g, c.you, 1, c.source);
  },
});

export default defineCard({
  name: 'Riveteers Overlook',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.objects[c.source]) return;
        yield* sacrifice(c.g, [c.source]);
        reflexive(c, busca.id!);
      }, { text: 'Quando entra, sacrifique-o. Quando fizer isso, procure uma Swamp, Mountain ou Forest básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.' }),
    ],
  }],
  rulings: {},
});
