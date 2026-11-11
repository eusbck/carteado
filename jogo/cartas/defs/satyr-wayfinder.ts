// Satyr Wayfinder
// When this creature enters, reveal the top four cards of your library. You may put a land card from among them into
// your hand. Put the rest into your graveyard.
import { chooseItems, defineCard, etb, isLand, moveObjects, nameOf } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Satyr Wayfinder',
  faces: [{
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        c.g.log(`${s.players[c.you].name} revela ${topo.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
        const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !isLand(c.g, id) }));
        const esc = itens.some((i) => !i.disabled) ? yield* chooseItems(c.g, c.you, 'Satyr Wayfinder: você pode pôr uma carta de terreno na sua mão', itens, 0, 1) : [];
        const terreno = esc.length ? Number(esc[0]) : null;
        if (terreno !== null) yield* moveObjects(c.g, [{ id: terreno, to: 'hand' }], 'effect');
        const resto = topo.filter((id) => id !== terreno && c.g.state.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
      }, { text: 'Quando esta criatura entra, revele as quatro cartas do topo do seu grimório. Você pode pôr uma carta de terreno dentre elas na sua mão. Coloque o resto no seu cemitério.' }),
    ],
  }],
  rulings: {},
});
