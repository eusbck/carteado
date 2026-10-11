// Brokers Hideout
// When this land enters, sacrifice it. When you do, search your library for a basic Forest, Plains, or Island card,
// put it onto the battlefield tapped, then shuffle and you gain 1 life.
// (mesmo texto de Riveteers Overlook, com outros tipos)
import { chars, defineAbility, defineCard, etb, fetchBasicToBattlefield, gainLife, reflexive, sacrifice, type TriggeredDef } from '../../motor/api.ts';

const TIPOS = ['Forest', 'Plains', 'Island'];

// CR 603.12: gatilho reflexivo ("Quando você fizer isso")
const busca = defineAbility<TriggeredDef>('Brokers Hideout:busca', {
  kind: 'triggered', on: { kind: 'batch', match: () => false },
  text: 'Procure uma Forest, Plains ou Island básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.',
  *effect(c) {
    yield* fetchBasicToBattlefield(c, 1, { filter: (id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), prompt: 'Procure uma carta de Forest, Plains ou Island básico' });
    gainLife(c.g, c.you, 1, c.source);
  },
});

export default defineCard({
  name: 'Brokers Hideout',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.objects[c.source]) return;
        yield* sacrifice(c.g, [c.source]);
        reflexive(c, busca.id!);
      }, { text: 'Quando entra, sacrifique-o. Quando fizer isso, procure uma Forest, Plains ou Island básica, coloque-a no campo virada, embaralhe e ganhe 1 de vida.' }),
    ],
  }],
  rulings: {},
});
