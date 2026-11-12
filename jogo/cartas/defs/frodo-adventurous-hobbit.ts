// Frodo, Adventurous Hobbit
// Partner with Sam, Loyal Attendant
// Vigilance
// Whenever Frodo attacks, if you gained 3 or more life this turn, the Ring tempts you. Then if Frodo is your
// Ring-bearer and the Ring has tempted you two or more times this game, draw a card.
import { defineCard, draw, isRingBearer, keyword, on, ringTemptations, ringTempts, triggered } from '../../motor/api.ts';
import { PARCEIROS } from '../condado.ts';
import { ANEL } from '../mordor.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Frodo, Adventurous Hobbit',
  faces: [{
    abilities: [
      parceiroCom('Sam, Loyal Attendant'),
      keyword('vigilance'),
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (rulings 1-3)
      triggered(on.selfAttacks(), function* (c) {
        yield* ringTempts(c.g, c.you);
        if (isRingBearer(c.g, c.source, c.you) && ringTemptations(c.g, c.you) >= 2) yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => c.g.state.turnStats[c.you].lifeGained >= 3,
        text: 'Sempre que Frodo ataca, se você ganhou 3 ou mais pontos de vida neste turno, o Anel tenta você. Depois, se Frodo é o seu Portador do Anel e o Anel tentou você duas ou mais vezes nesta partida, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com 3 ou mais de vida ganha no turno, o Anel tenta uma vez; sem isso, nem dispara',
    2: 'regra geral: conta a vida ganha no turno inteiro (TurnStats.lifeGained), sem descontar a perdida',
    3: 'teste: com 3 ou mais de vida ganha no turno, o Anel tenta uma vez; sem isso, nem dispara',
    4: ANEL.emblema,
    5: ANEL.semCriatura,
    6: ANEL.mesmo,
    7: ANEL.ordem,
    8: ANEL.obrigatorio,
    9: ANEL.um,
    10: ANEL.alvos,
    11: 'teste: ao entrar, o jogador alvo pode pôr o Sam do grimório na mão',
    12: PARCEIROS.busca,
    13: PARCEIROS.montagem,
    14: PARCEIROS.identidade,
    15: PARCEIROS.comecam,
    16: PARCEIROS.doisSo,
    17: PARCEIROS.separados,
    18: PARCEIROS.controla,
    19: PARCEIROS.gatilho,
  },
});
