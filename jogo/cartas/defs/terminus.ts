// Terminus
// Put all creatures on the bottom of their owners' libraries.
// Miracle {W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)
import { allCreatures, defineCard, miracle } from '../../motor/api.ts';
import { MILAGRE, poeNoFundoDosDonos } from '../milagres.ts';

export default defineCard({
  name: 'Terminus',
  faces: [{
    abilities: [miracle('{W}')],
    spell: {
      *effect(c) {
        yield* poeNoFundoDosDonos(c, allCreatures(c.g));
      },
    },
  }],
  rulings: {
    1: MILAGRE.continuaComprada,
    2: MILAGRE.revelarAntes,
    3: MILAGRE.qualquerTurno,
    4: MILAGRE.primeiraDaSequencia,
    5: MILAGRE.semComprar,
    6: MILAGRE.naoPrecisaRevelar,
    7: MILAGRE.soNaResolucao,
    8: 'teste: comprada no turno do oponente, revelada e conjurada pelo milagre {W}: todas as criaturas vão para o fundo dos grimórios',
    9: MILAGRE.custoAlternativo,
    10: MILAGRE.custoTotal,
    11: MILAGRE.saiuDaMao,
    12: 'teste: cada dono escolhe a ordem das suas criaturas no fundo do grimório',
  },
});
