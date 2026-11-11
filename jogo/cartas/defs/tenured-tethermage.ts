// Tenured Tethermage
// When this creature enters, you may sacrifice a land. If you do, create two tapped Heartwood tokens.
// Tap two untapped artifacts you control: Put two +1/+1 counters on this creature.
import { activated, addCounters, chooseItems, createTokens, defineCard, etb, isType, nameOf, objItem, sacrifice, yesNo } from '../../motor/api.ts';
import { terrenosDe } from '../terras.ts';

export default defineCard({
  name: 'Tenured Tethermage',
  faces: [{
    abilities: [
      etb(function* (c) {
        const terras = terrenosDe(c.g, c.you);
        if (!terras.length || !(yield* yesNo(c.g, c.you, 'Tenured Tethermage: sacrificar um terreno para criar duas fichas Heartwood?'))) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Sacrifique um terreno', terras.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        const [foi] = yield* sacrifice(c.g, [Number(esc)]);
        if (foi !== null && foi !== undefined) yield* createTokens(c.g, c.you, 'Heartwood', 2, { tapped: true });
      }, { text: 'Quando esta criatura entra, você pode sacrificar um terreno. Se fizer isso, crie duas fichas Heartwood viradas.' }),
      activated([{ k: 'tapPermanents', n: 2, filter: (c, id) => isType(c.g, id, 'Artifact'), label: 'dois artefatos desvirados' }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: 'Vire dois artefatos desvirados que você controla: Coloque dois marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {},
});
