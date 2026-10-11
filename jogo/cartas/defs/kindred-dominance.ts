// Kindred Dominance
// Choose a creature type. Destroy all creatures that aren't of the chosen type.
import { allCreatures, chars, chooseCreatureType, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: 'Kindred Dominance',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: o tipo é escolhido na resolução, sem respostas no meio
        const tipo = yield* chooseCreatureType(c.g, c.you, 'Kindred Dominance: escolha um tipo de criatura');
        const ids = allCreatures(c.g).filter((id) => !chars(c.g, id).subtypes.includes(tipo));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'teste: destrói todas as criaturas que não são do tipo escolhido na resolução',
    2: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos (motor/efeitos.ts chooseCreatureType)',
    3: 'teste: a criatura de dois tipos sobrevive se um deles for o escolhido',
  },
});
