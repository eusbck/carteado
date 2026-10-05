// Ribtruss Roaster
// Devour 1 (As this creature enters, you may sacrifice any number of creatures. This creature enters with that many
// +1/+1 counters on it.)
// At the beginning of your end step, create a number of 1/1 black and green Pest creature tokens equal to the number of
// +1/+1 counters on this creature. They have "When this token dies, you gain 1 life."
import { createTokens, defineCard, devour, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ribtruss Roaster',
  faces: [{
    abilities: [
      // ruling 2: só devora o que já estava no campo
      devour(1),
      triggered(on.endStep('you'), function* (c) {
        // ruling 1: fora do campo, usa os marcadores da última vez que esteve lá
        const o = c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj;
        const n = o?.counters['+1/+1'] ?? 0;
        if (n > 0) yield* createTokens(c.g, c.you, 'Pest', n);
      }, { text: 'No início da sua etapa final, crie fichas de criatura Pest pretas e verdes 1/1 igual ao número de marcadores +1/+1 nesta criatura. Elas têm "Quando esta ficha morre, você ganha 1 de vida."' }),
    ],
  }],
  rulings: {
    1: 'teste: fora do campo, usa os marcadores da última vez',
    2: 'regra geral: CR 702.82b — não devora quem entra junto',
  },
});
