// Dread Tiller
// When this creature enters, put a -1/-1 counter on target creature.
// Whenever a creature with a -1/-1 counter on it dies, you may put a land card from your hand or graveyard onto the
// battlefield tapped.
import { addCounters, chooseItems, defineCard, etb, isLand, nameOf, objItem, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Dread Tiller',
  faces: [{
    abilities: [
      etb(function* (c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you); },
        { targets: [t.creature()], text: 'Quando esta criatura entra, coloque um marcador -1/-1 na criatura alvo.' }),
      triggered(on.dies((_c, _l, o) => (o.counters['-1/-1'] ?? 0) > 0), function* (c) {
        const s = c.g.state;
        const opcoes = [...s.zones.hand[c.you], ...s.zones.graveyard[c.you]].filter((id) => isLand(c.g, id));
        if (opcoes.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, 'Dread Tiller: você pode colocar uma carta de terreno da mão ou do cemitério no campo virada', opcoes.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (${s.objects[id].zone === 'hand' ? 'mão' : 'cemitério'})`)), 0, 1);
        if (pick.length) yield* putOntoBattlefield(c.g, [{ id: Number(pick[0]), controller: c.you, tapped: true }], 'effect');
      }, { text: 'Sempre que uma criatura com um marcador -1/-1 morre, você pode colocar uma carta de terreno da sua mão ou do seu cemitério no campo virada.' }),
    ],
  }],
  rulings: {},
});
