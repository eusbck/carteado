// Tenured Tethermage
// When this creature enters, you may sacrifice a land. If you do, create two tapped Heartwood tokens. (They're red and
// green artifacts with "{T}: Add {R} or {G}.")
// Tap two untapped artifacts you control: Put two +1/+1 counters on this creature.
import { activated, addCounters, chooseItems, controlledBy, createTokens, defineCard, etb, isLand, nameOf, objItem, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Tenured Tethermage',
  faces: [{
    abilities: [
      etb(function* (c) {
        const terrenos = controlledBy(c.g, c.you, (id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Tenured Tethermage: você pode sacrificar um terreno', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        yield* sacrifice(c.g, [Number(esc[0])]);
        yield* createTokens(c.g, c.you, 'Heartwood', 2, { tapped: true });
      }, { text: 'Quando esta criatura entra, você pode sacrificar um terreno. Se fizer isso, crie duas fichas de Heartwood viradas.' }),
      activated('Tap two untapped artifacts you control', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: 'Vire dois artefatos desvirados que você controla: Coloque dois marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: { 1: 'teste: sacrificando um terreno, cria duas fichas de Heartwood viradas' },
});
