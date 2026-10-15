// Entreat the Angels
// Create X 4/4 white Angel creature tokens with flying.
// Miracle {X}{W}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this
// turn.)
import { createTokens, defineCard, miracle } from '../../motor/api.ts';
import { MILAGRE } from '../milagres.ts';

export default defineCard({
  name: 'Entreat the Angels',
  faces: [{
    abilities: [miracle('{X}{W}{W}')],
    spell: {
      *effect(c) {
        yield* createTokens(c.g, c.you, 'Angel', c.x);
      },
    },
  }],
  rulings: {
    1: MILAGRE.continuaComprada,
    2: MILAGRE.custoTotal,
    3: MILAGRE.saiuDaMao,
    4: MILAGRE.revelarAntes,
    5: MILAGRE.qualquerTurno,
    6: MILAGRE.primeiraDaSequencia,
    7: MILAGRE.semComprar,
    8: MILAGRE.naoPrecisaRevelar,
    9: MILAGRE.soNaResolucao,
    10: MILAGRE.ignoraTempo,
    11: MILAGRE.custoAlternativo,
    12: 'teste: pelo milagre com X = 2 paga {2}{W}{W}, cria dois Angels e o valor de mana na pilha é 7',
    13: 'teste: pelo custo normal com X = 1 paga {2}{W}{W}{W} e cria um Angel',
  },
});
