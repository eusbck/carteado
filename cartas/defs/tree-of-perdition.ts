// Tree of Perdition
// Defender
// {T}: Exchange target opponent's life total with this creature's toughness.
import { activated, defineCard, exchangeLifeAndToughness, keyword, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Tree of Perdition',
  faces: [{
    abilities: [
      keyword('defender'),
      activated('{T}', function* (c) {
        const p = tgtPlayer(c);
        // ruling 2: fora do campo, a troca não acontece
        if (p !== null) exchangeLifeAndToughness(c, p, c.source);
      }, { targets: [t.opponent()], text: '{T}: Troque o total de vida do oponente alvo pela resistência desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: modificadores de resistência se aplicam depois da troca',
    2: 'regra geral: CR 701.12c — fora do campo, a troca não acontece',
    3: 'teste: o jogador ganha ou perde a diferença',
  },
});
