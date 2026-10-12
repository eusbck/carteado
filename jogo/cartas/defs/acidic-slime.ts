// Acidic Slime
// Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)
// When this creature enters, destroy target artifact, enchantment, or land.
import { defineCard, destroy, etb, is, keyword, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Acidic Slime',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent(or(is.artifact, is.enchantment, is.land), 'artefato, encantamento ou terreno alvo')], text: 'Quando esta criatura entra, destrua o artefato, encantamento ou terreno alvo.' }),
    ],
  }],
  rulings: {},
});