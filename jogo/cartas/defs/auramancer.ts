// Auramancer
// When this creature enters, you may return target enchantment card from your graveyard to your hand.
import { defineCard, etb, is, moveObjects, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Auramancer',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        // "você pode": o alvo é opcional (até um)
        targets: [upTo(1, t.card('graveyard', is.enchantment, 'carta de encantamento alvo do seu cemitério', 'you'))],
        text: 'Quando esta criatura entra, você pode devolver a carta de encantamento alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {},
});
