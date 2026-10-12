// Raise the Palisade
// Choose a creature type. Return all creatures that aren't of the chosen type to their owners' hands.
import { allCreatures, chars, chooseCreatureType, defineCard, moveObjects } from '../../motor/api.ts';

export default defineCard({
  name: 'Raise the Palisade',
  faces: [{
    spell: {
      *effect(c) {
        const tipo = yield* chooseCreatureType(c.g, c.you, 'Raise the Palisade: escolha um tipo de criatura');
        const ids = allCreatures(c.g).filter((id) => !chars(c.g, id).subtypes.includes(tipo));
        if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 205.3m — só um tipo de criatura existente pode ser escolhido (motor/efeitos.ts chooseCreatureType)' },
});