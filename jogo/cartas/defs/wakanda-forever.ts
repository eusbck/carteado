// Wakanda Forever!
// Reveal the top six cards of your library. You may put a permanent card from among them onto the battlefield with an
// indestructible counter on it. You may put a permanent card from among them into your hand. Put the rest into your
// graveyard.
import { chooseItems, defineCard, isPermanentCard, moveObjects, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Wakanda Forever!',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 6);
        if (!topo.length) return;
        c.g.log(`${s.players[c.you].name} revela ${topo.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
        const itens = (ids: ObjId[]) => ids.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def }, disabled: !isPermanentCard(c.g, id) }));
        const paraOCampo = yield* chooseItems(c.g, c.you, 'Wakanda Forever!: você pode colocar uma carta de permanente no campo com um marcador de indestrutível', itens(topo), 0, 1);
        // CR 122.1b: o marcador de indestrutível dá a palavra-chave à permanente
        if (paraOCampo.length) yield* putOntoBattlefield(c.g, [{ id: Number(paraOCampo[0]), controller: c.you, counters: { indestructible: 1 } }], 'effect');
        const sobram = topo.filter((id) => s.objects[id]?.zone === 'library');
        const paraAMao = sobram.length ? yield* chooseItems(c.g, c.you, 'Wakanda Forever!: você pode colocar uma carta de permanente na sua mão', itens(sobram), 0, 1) : [];
        if (paraAMao.length) yield* moveObjects(c.g, [{ id: Number(paraAMao[0]), to: 'hand' }], 'effect');
        const resto = topo.filter((id) => s.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
      },
    },
  }],
  rulings: {},
});