// Dread Cacodemon
// When this creature enters, if you cast it from your hand, destroy all creatures your opponents control, then tap all
// other creatures you control.
import { allCreatures, controllerOf, creaturesOf, defineCard, destroy, etb, tap } from '../../motor/api.ts';
import { conjuradaDaMao } from '../inferno.ts';

export default defineCard({
  name: 'Dread Cacodemon',
  faces: [{
    abilities: [
      etb(function* (c) {
        const deles = allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id)));
        if (deles.length) yield* destroy(c.g, deles);
        for (const id of creaturesOf(c.g, c.you)) if (id !== c.source && !c.g.state.objects[id].tapped) tap(c.g, id);
      }, {
        // CR 603.4: cláusula "se" interveniente; ruling 2: posta no campo direto da mão (Kaalia), não dispara
        condition: (c) => conjuradaDaMao(c.g, c.source),
        text: 'Quando esta criatura entra, se você a conjurou da sua mão, destrua todas as criaturas que os seus oponentes controlam, depois vire todas as outras criaturas que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.4 — o que conta é a mágica ter sido conjurada da mão; a permanente guarda isso (cartas/inferno.ts conjuradaDaMao)',
    2: 'teste: posta no campo sem ser conjurada, a habilidade não dispara',
  },
});