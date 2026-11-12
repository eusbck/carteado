// Pick Your Poison
// Choose one —
// • Each opponent sacrifices an artifact of their choice.
// • Each opponent sacrifices an enchantment of their choice.
// • Each opponent sacrifices a creature with flying of their choice.
import { defineCard, eachSacrifices, hasKw, isCreature, isType, modal } from '../../motor/api.ts';

export default defineCard({
  name: 'Pick Your Poison',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        { text: 'Cada oponente sacrifica um artefato à escolha dele', *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isType(c.g, id, 'Artifact'), 1, 'um artefato'); } },
        { text: 'Cada oponente sacrifica um encantamento à escolha dele', *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isType(c.g, id, 'Enchantment'), 1, 'um encantamento'); } },
        { text: 'Cada oponente sacrifica uma criatura com voar à escolha dele', *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id) && hasKw(c.g, id, 'flying'), 1, 'uma criatura com voar'); } },
      ]),
    },
  }],
  rulings: {},
});
