// Winds of Rath — Destroy all creatures that aren't enchanted. They can't be regenerated.
import { allCreatures, defineCard, destroy, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Winds of Rath',
  faces: [{
    spell: {
      *effect(c) {
        const ctx = { g: c.g, you: c.you, source: c.source };
        yield* destroy(c.g, allCreatures(c.g).filter((id) => !is.enchanted(ctx, id)));
      },
    },
  }],
  rulings: {
    1: "teste: destrói as criaturas que não estão encantadas; uma criatura com Aura fica",
  },
});
