// Skyfisher Spider
// Reach
// When this creature enters, you may sacrifice another creature. When you do, destroy target nonland permanent.
// When this creature dies, you may gain 1 life for each creature card in your graveyard. If you do, exile this card
// from your graveyard.
import {
  chooseItems, controlledBy, defineAbility, defineCard, destroy, etb, exile, gainLife, isCreature, keywords, nameOf, objItem, on,
  reflexive, sacrifice, t, tgt, triggered, yesNo,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// "quando você fizer isso" (CR 603.12): o alvo é escolhido só depois do sacrifício (rulings 1-2)
const DESTROI = defineAbility('Skyfisher Spider:destroi', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* destroy(c.g, [id]);
}, { targets: [t.nonlandPermanent()], text: 'Destrua a permanente não terreno alvo.' }));

export default defineCard({
  name: 'Skyfisher Spider',
  faces: [{
    abilities: [
      ...keywords('reach'),
      etb(function* (c) {
        const outras = controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id));
        if (!outras.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Skyfisher Spider: sacrificar outra criatura para destruir uma permanente não terreno?',
          [{ id: 'nao', label: 'Não sacrificar' }, ...outras.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
        if (esc === 'nao') return;
        const [foi] = yield* sacrifice(c.g, [Number(esc)]);
        if (foi !== null && foi !== undefined) reflexive(c, DESTROI.id!);
      }, { text: 'Quando esta criatura entra, você pode sacrificar outra criatura. Quando fizer isso, destrua a permanente não terreno alvo.' }),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source ? { carta: e.obj } : false)), function* (c) {
        const carta = c.event.carta as ObjId;
        const n = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length;
        if (n === 0 || !(yield* yesNo(c.g, c.you, `Skyfisher Spider: ganhar ${n} de vida e exilar esta carta do cemitério?`))) return;
        gainLife(c.g, c.you, n, c.source);
        if (c.g.state.objects[carta]?.zone === 'graveyard') yield* exile(c.g, [carta]);
      }, { text: 'Quando esta criatura morre, você pode ganhar 1 de vida para cada carta de criatura no seu cemitério. Se fizer isso, exile esta carta do seu cemitério.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrifica outra criatura e só então escolhe a permanente não terreno a destruir',
    2: 'teste: sacrifica outra criatura e só então escolhe a permanente não terreno a destruir',
  },
});
