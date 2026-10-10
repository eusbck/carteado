// Adaptive Omnitool
// Equipped creature gets +1/+1 for each artifact you control.
// Whenever equipped creature attacks, look at the top six cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.
// Equip {3}
import { attachedGets, chooseItems, defineCard, equip, isType, moveObjects, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Adaptive Omnitool",
  faces: [{
    abilities: [
      attachedGets((c) => { const n = artifacts(c).length; return [{ k: 'pt', p: n, t: n }]; }, 'A criatura equipada recebe +1/+1 por artefato seu.'),
      triggered(on.attacks((c, id) => c.g.state.objects[c.source]?.attachedTo === id), function*(c) {
        const s = c.g.state; const top = s.zones.library[c.you].slice(0, 6);
        const items = top.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def }, disabled: !isType(c.g, id, 'Artifact') }));
        const picked = yield* chooseItems(c.g, c.you, 'Adaptive Omnitool: você pode revelar um artefato entre as seis cartas do topo', items, 0, 1);
        const chosen = picked.length ? Number(picked[0]) : null;
        if (chosen !== null) { c.g.log(s.players[c.you].name + ' revela ' + nameOf(c.g, chosen) + '.', { rule: '701.20' }); yield* moveObjects(c.g, [{ id: chosen, to: 'hand' }], 'effect'); }
        const rest = shuffle(s.rng, top.filter((id) => id !== chosen && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !rest.includes(id)), ...rest]; c.g.bump();
      }, { text: 'Quando a criatura equipada ataca, olhe seis cartas do topo. Pode revelar um artefato e pôr na mão; o resto vai ao fundo em ordem aleatória.' }), equip('{3}'),
    ]
  }],
  rulings: {},
});
