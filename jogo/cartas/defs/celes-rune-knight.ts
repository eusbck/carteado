// Celes, Rune Knight
// When Celes enters, discard any number of cards, then draw that many cards plus one.
// Whenever one or more other creatures you control enter, if one or more of them entered from a graveyard or was cast
// from a graveyard, put a +1/+1 counter on each creature you control.
import { addCounters, chooseItems, controllerOf, creaturesOf, defineCard, discard, draw, etb, isCreature, nameOf, objItem, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Celes, Rune Knight',
  faces: [{
    abilities: [
      etb(function* (c) {
        const mao = c.g.state.zones.hand[c.you];
        // ruling 1: pode descartar nenhuma e só comprar uma
        const pick = mao.length ? yield* chooseItems(c.g, c.you, 'Celes: descarte quantas cartas quiser (compra essa quantidade mais uma)', mao.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, mao.length) : [];
        const fora = pick.length ? yield* discard(c.g, c.you, pick.length, { filter: (id) => pick.includes(String(id)) }) : [];
        yield* draw(c.g, c.you, fora.length + 1);
      }, { text: 'Quando Celes entra, descarte qualquer número de cartas e depois compre essa quantidade mais uma.' }),
      triggered(on.batch((evs, c) => evs.some((e) => {
        if (e.type !== 'zone' || e.to !== 'battlefield' || e.obj === c.source) return false;
        const o = c.g.state.objects[e.obj];
        if (!o || !isCreature(c.g, e.obj) || controllerOf(c.g, e.obj) !== c.you) return false;
        return e.from === 'graveyard' || (o.data.spell as { castFrom?: string } | undefined)?.castFrom === 'graveyard';
      })), function* (c) {
        for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma ou mais outras criaturas suas entram, se alguma delas veio de um cemitério ou foi conjurada de um cemitério, coloque um marcador +1/+1 em cada criatura sua.' }),
    ],
  }],
  rulings: { 1: 'teste: pode descartar nenhuma e só comprar uma' },
});
