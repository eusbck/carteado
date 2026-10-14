// Time Wipe
// Return a creature you control to its owner's hand, then destroy all creatures.
import { allCreatures, chooseItems, controlledBy, defineCard, destroy, isCreature, nameOf, returnToHand } from '../../motor/api.ts';

export default defineCard({
  name: 'Time Wipe',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: a escolha é na resolução, e nada acontece entre devolver e destruir
        const minhas = controlledBy(c.g, c.you, (id) => isCreature(c.g, id));
        if (minhas.length) {
          const [r] = yield* chooseItems(c.g, c.you, 'Time Wipe: escolha uma criatura sua para devolver à mão do dono',
            minhas.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id })), 1, 1);
          yield* returnToHand(c.g, [Number(r)]);
        }
        yield* destroy(c.g, allCreatures(c.g));
      },
    },
  }],
  rulings: {
    1: 'teste: devolve uma criatura sua para a mão e destrói todas as outras',
    2: 'teste: sem criaturas suas, só destrói todas as criaturas',
  },
});
