// Tree of Redemption
// Defender
// {T}: Exchange your life total with this creature's toughness.
import { activated, defineCard, exchangeLifeAndToughness, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Tree of Redemption',
  faces: [{
    abilities: [
      keyword('defender'),
      activated('{T}', function* (c) {
        // ruling 1: fora do campo, a troca não acontece
        exchangeLifeAndToughness(c, c.you, c.source);
      }, { text: '{T}: Troque o seu total de vida pela resistência desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.12c — fora do campo, a troca não acontece',
    2: 'teste: você ganha a diferença',
    3: 'teste: modificadores de resistência se aplicam depois da troca',
  },
});
