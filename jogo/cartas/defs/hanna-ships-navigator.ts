// Hanna, Ship's Navigator
// {1}{W}{U}, {T}: Return target artifact or enchantment card from your graveyard to your hand.
import { activated, defineCard, is, moveObjects, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Hanna, Ship's Navigator",
  faces: [{
    abilities: [
      activated('{1}{W}{U}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, { targets: [t.card('graveyard', or(is.artifact, is.enchantment), 'carta de artefato ou encantamento alvo no seu cemitério')], text: '{1}{W}{U}, {T}: Devolva a carta de artefato ou encantamento alvo do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {},
});
