// Demonic Tutor
// Search your library for a card, put that card into your hand, then shuffle.
import { defineCard, moveObjects, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Demonic Tutor',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1-3: escolhida na resolução, sem revelar; vai direto para a mão (não é compra)
        const achados = yield* searchLibrary(c.g, c.you, c.you, { max: 1, prompt: 'Demonic Tutor: procure uma carta' });
        if (achados.length) yield* moveObjects(c.g, achados.map((id) => ({ id, to: 'hand' as const })), 'search');
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: a carta é escolhida na resolução e vai para a mão sem ser comprada',
    2: 'regra geral: CR 701.23a — a busca não revela a carta (motor/actions.ts searchLibrary)',
    3: 'teste: a carta é escolhida na resolução e vai para a mão sem ser comprada',
  },
});
