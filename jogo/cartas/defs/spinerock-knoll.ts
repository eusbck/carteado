// Spinerock Knoll
// Hideaway 4 (When this land enters, look at the top four cards of your library, exile one face down, then put the rest
// on the bottom in a random order.)
// This land enters tapped.
// {T}: Add {R}.
// {R}, {T}: You may play the exiled card without paying its mana cost if an opponent was dealt 7 or more damage this turn.
import { activated, defineCard, hideaway, land, linkedExiled, mana, mayPlayFree, nameOf, opponentDamageThisTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Spinerock Knoll',
  faces: [{
    abilities: [
      // CR 702.75a
      hideaway(4),
      land.tapped(),
      mana('R'),
      activated('{R}, {T}', function* (c) {
        // rulings 5-7: conferido na resolução; conta o dano total que um oponente sofreu no turno, de qualquer fonte
        if (opponentDamageThisTurn(c.g, c.you) < 7) return;
        const [carta] = linkedExiled(c.g, c.source, 'hideaway');
        if (carta === undefined) return;
        yield* mayPlayFree(c.g, c.you, carta, `Spinerock Knoll: jogar ${nameOf(c.g, carta)} sem pagar o custo de mana?`);
      }, { text: '{R}, {T}: Você pode jogar a carta exilada sem pagar o custo de mana se um oponente sofreu 7 ou mais de dano neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado',
    2: 'regra geral: CR 702.75a — quem controla o permanente pode olhar a carta escondida (motor/criaturas.ts hideaway, visibleTo)',
    3: 'teste: esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado',
    4: 'regra geral: CR 702.75a — o resto vai para o fundo em ordem aleatória (testes/regras-criaturas.test.ts)',
    5: 'teste: com 7 ou mais de dano num oponente neste turno, joga a carta escondida sem pagar',
    6: 'teste: com 7 ou mais de dano num oponente neste turno, joga a carta escondida sem pagar',
    7: 'teste: com menos de 7 de dano, a carta continua exilada',
  },
});
