// Myr Retriever
// When this creature dies, return another target artifact card from your graveyard to your hand.
import { defineCard, isType, lkiObj, on, returnToHand, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Myr Retriever",
  faces: [{ abilities: [triggered(on.selfDies(), function*(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); }, { targets: [t.card('graveyard', (c, id) => isType(c.g, id, 'Artifact') && c.g.state.objects[id].card !== lkiObj(c.g, c.source)?.card, 'outra carta de artefato alvo no seu cemitério')], text: 'Quando esta criatura morre, devolva outra carta de artefato alvo do seu cemitério à mão.' })] }],
  rulings: {
    "1": "CR 603.3d, 603.10: teste: um artefato que morre no mesmo lote pode ser escolhido; a própria carta não pode."
  },
});
