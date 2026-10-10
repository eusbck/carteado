// Thirst for Knowledge
// Draw three cards. Then discard two cards unless you discard an artifact card.
import { chooseItems, defineCard, discard, draw, isType } from '../../motor/api.ts';

export default defineCard({
  name: "Thirst for Knowledge",
  faces: [{
    spell: {
      effect: function*(c) {
        yield* draw(c.g, c.you, 3);
        const artifactsInHand = c.g.state.zones.hand[c.you].filter((id) => isType(c.g, id, 'Artifact'));
        const [mode] = yield* chooseItems(c.g, c.you, 'Thirst for Knowledge: escolha o descarte', [{ id: 'two', label: 'Descartar duas cartas' }, { id: 'artifact', label: 'Descartar um artefato', disabled: artifactsInHand.length === 0 }], 1, 1);
        yield* discard(c.g, c.you, mode === 'artifact' ? 1 : 2, mode === 'artifact' ? { filter: (id) => isType(c.g, id, 'Artifact') } : {});
      }
    }
  }],
  rulings: {
    "1": "teste: pode escolher descartar um artefato ou quaisquer duas cartas, inclusive dois artefatos."
  },
});
