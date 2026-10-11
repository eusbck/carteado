// Reiver Demon
// Flying
// When this creature enters, if you cast it from your hand, destroy all nonartifact, nonblack creatures. They can't be
// regenerated.
import { allCreatures, chars, defineCard, destroy, etb, keyword, preventRegeneration } from '../../motor/api.ts';
import { conjuradaDaMao } from '../inferno.ts';

export default defineCard({
  name: 'Reiver Demon',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const ids = allCreatures(c.g).filter((id) => !chars(c.g, id).types.includes('Artifact') && !chars(c.g, id).colors.includes('B'));
        if (!ids.length) return;
        preventRegeneration(c, ids);
        yield* destroy(c.g, ids);
      }, {
        // CR 603.4: cláusula "se" interveniente; ruling 1: vale para o que foi conjurado da mão, mesmo entrando como cópia
        condition: (c) => conjuradaDaMao(c.g, c.source),
        text: 'Quando esta criatura entra, se você a conjurou da sua mão, destrua todas as criaturas que não são artefatos nem pretas. Elas não podem ser regeneradas.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.4 — o que conta é a mágica ter sido conjurada da mão; a permanente guarda isso (cartas/inferno.ts conjuradaDaMao)',
  },
});