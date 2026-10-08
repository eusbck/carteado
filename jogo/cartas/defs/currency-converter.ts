// Currency Converter
// Whenever you discard a card, you may exile that card from your graveyard.
// {2}, {T}: Draw a card, then discard a card.
// {T}: Put a card exiled with this artifact into its owner's graveyard. If it's a land card, create a Treasure token.
// If it's a nonland card, create a 2/2 black Rogue creature token.
import {
  activated, chooseItems, createTokens, defineCard, discard, draw, exile, isLand, moveObjects, nameOf, objItem, on, triggered, yesNo,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'convertidas';

export default defineCard({
  name: 'Currency Converter',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'discard' && e.player === c.you ? { card: e.obj } : false), function* (c) {
        const id = c.event.card as ObjId;
        if (c.g.state.objects[id]?.zone !== 'graveyard') return;
        if (yield* yesNo(c.g, c.you, `Currency Converter: exilar ${nameOf(c.g, id)} do seu cemitério?`)) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, { text: 'Sempre que você descarta uma carta, você pode exilar essa carta do seu cemitério.' }),
      activated('{2}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        yield* discard(c.g, c.you, 1);
      }, { text: '{2}, {T}: Compre uma carta e depois descarte uma carta.' }),
      activated('{T}', function* (c) {
        const me = c.g.state.objects[c.source];
        const exiladas = (me?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (exiladas.length === 0) return;
        const [pick] = yield* chooseItems(c.g, c.you, 'Currency Converter: escolha uma carta exilada com ele', exiladas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const id = Number(pick);
        const terreno = isLand(c.g, id);
        yield* moveObjects(c.g, [{ id, to: 'graveyard' }], 'effect');
        yield* createTokens(c.g, c.you, terreno ? 'Treasure' : 'Rogue', 1);
      }, { text: '{T}: Coloque uma carta exilada com este artefato no cemitério do dono. Se for uma carta de terreno, crie uma ficha de Tesouro. Se não for, crie uma ficha de criatura Rogue preta 2/2.' }),
    ],
  }],
  rulings: {},
});
