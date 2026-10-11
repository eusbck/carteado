// Maestros Theater
// When this land enters, sacrifice it. When you do, search your library for a basic Island, Swamp, or Mountain card,
// put it onto the battlefield tapped, then shuffle and you gain 1 life.
// (mesmo texto de Riveteers Overlook, com outros tipos)
import { chars, defineAbility, defineCard, etb, fetchBasicToBattlefield, gainLife, reflexive, sacrifice, type TriggeredDef } from '../../motor/api.ts';

const TIPOS = ['Island', 'Swamp', 'Mountain'];

// CR 603.12: gatilho reflexivo ("Quando você fizer isso")
const busca = defineAbility<TriggeredDef>('Maestros Theater:busca', {
  kind: 'triggered', on: { kind: 'batch', match: () => false },
  text: 'Procure uma Island, Swamp ou Mountain básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.',
  *effect(c) {
    yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), prompt: 'Procure uma carta de Island, Swamp ou Mountain básico' });
    gainLife(c.g, c.you, 1, c.source);
  },
});

export default defineCard({
  name: 'Maestros Theater',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.objects[c.source]) return;
        yield* sacrifice(c.g, [c.source]);
        reflexive(c, busca.id!);
      }, { text: 'Quando entra, sacrifique-o. Quando fizer isso, procure uma Island, Swamp ou Mountain básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.' }),
    ],
  }],
  rulings: {},
});
