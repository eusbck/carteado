// Spire of Industry
// {T}: Add {C}.
// {T}, Pay 1 life: Add one mana of any color. Activate only if you control an artifact.
import { controlledBy, defineCard, isType, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Spire of Industry',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('any', {
        cost: '{T}, Pay 1 life',
        condition: (c) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length > 0,
        text: '{T}, Pague 1 de vida: Adicione uma mana de qualquer cor. Ative somente se você controla um artefato.',
      }),
    ],
  }],
  rulings: {},
});
