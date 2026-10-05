// Wickerbough Elder
// This creature enters with a -1/-1 counter on it.
// {G}, Remove a -1/-1 counter from this creature: Destroy target artifact or enchantment.
import { activated, defineCard, destroy, entersWithCounters, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Wickerbough Elder',
  faces: [{
    abilities: [
      entersWithCounters('-1/-1', 1),
      // ruling 1: precisa de um alvo legal para ativar
      activated('{G}, Remove a -1/-1 counter from this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')], text: '{G}, Remova um marcador -1/-1 desta criatura: Destrua o artefato ou encantamento alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem alvo, não pode ativar',
    2: 'regra geral: CR 704.5q — +1/+1 e -1/-1 se anulam antes de ativar',
  },
});
