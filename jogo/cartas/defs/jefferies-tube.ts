// Jefferies Tube
// {2}, {T}: Put two charge counters on target artifact.
// {3}, {T}: Target creature you control can't be blocked this turn.
// {4}, {T}: Draw a card. You may put a land card from your hand onto the battlefield tapped.
import { activated, addCounters, chooseItems, defineCard, draw, is, isLand, nameOf, objItem, putOntoBattlefield, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Jefferies Tube',
  faces: [{
    abilities: [
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, 'charge', 2, c.you);
      }, { targets: [t.artifact(undefined, 'artefato alvo')], text: '{2}, {T}: Coloque dois marcadores de carga no artefato alvo.' }),
      activated('{3}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: '{3}, {T}: A criatura alvo que você controla não pode ser bloqueada neste turno.' }),
      activated('{4}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        const terrenos = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (!terrenos.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Jefferies Tube: você pode pôr uma carta de terreno da sua mão no campo, virada', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you, tapped: true }], 'effect');
      }, { text: '{4}, {T}: Compre uma carta. Você pode pôr uma carta de terreno da sua mão no campo, virada.' }),
    ],
  }],
  rulings: {},
});
