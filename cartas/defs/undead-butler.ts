// Undead Butler
// When this creature enters, mill three cards. (Put the top three cards of your library into your graveyard.)
// When this creature dies, you may exile it. When you do, return target creature card from your graveyard to your
// hand.
import { defineAbility, defineCard, etb, exile, is, mill, moveObjects, on, reflexive, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// CR 603.12: gatilho reflexivo; o alvo é escolhido quando ele vai para a pilha, depois do exílio
const DEVOLVER = defineAbility('Undead Butler:devolver', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
}, {
  targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
  text: 'Quando fizer isso, devolva a carta de criatura alvo do seu cemitério para a sua mão.',
}));

export default defineCard({
  name: 'Undead Butler',
  faces: [{
    abilities: [
      etb(function* (c) { yield* mill(c.g, c.you, 3); }, { text: 'Quando esta criatura entra, moa três cartas.' }),
      triggered(on.selfDies(), function* (c) {
        // "exile-a": a carta que foi para o cemitério (CR 400.7e); se já saiu de lá, não dá para exilar
        const carta = c.event.obj as ObjId;
        if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, 'Undead Butler: exilar esta carta do cemitério?'))) return;
        const [exilada] = yield* exile(c.g, [carta]);
        if (exilada !== null && exilada !== undefined && c.g.state.objects[exilada]?.zone === 'exile') reflexive(c, DEVOLVER.id!);
      }, { text: 'Quando esta criatura morre, você pode exilá-la. Quando fizer isso, devolva a carta de criatura alvo do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {},
});
