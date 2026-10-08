// Overlord of the Mistmoors
// Impending 4—{2}{W}{W} (If you cast this spell for its impending cost, it enters with four time counters and isn't a
// creature until the last is removed. At the beginning of your end step, remove a time counter from it.)
// Whenever this permanent enters or attacks, create two 2/1 white Insect creature tokens with flying.
import { createTokens, defineCard, impending, on, triggered } from '../../motor/api.ts';

// CR 702.176a: custo alternativo, entra com marcadores de tempo, não é criatura enquanto tiver marcador, remove um
// no início da sua etapa final
const IMINENTE = impending(4, '{2}{W}{W}');

export default defineCard({
  name: 'Overlord of the Mistmoors',
  faces: [{
    altCosts: [IMINENTE.altCost],
    abilities: [
      ...IMINENTE.abilities,
      // "entra ou ataca": entrar dispara mesmo sem ser criatura (é um encantamento com marcadores de tempo)
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        yield* createTokens(c.g, c.you, 'Insect 2/1', 2);
      }, { text: 'Sempre que este permanente entra ou ataca, crie duas fichas de criatura Inseto 2/1 brancas com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: pelo custo iminente continua sendo mágica de criatura e só se conjura quando se poderia conjurar a criatura',
    2: 'teste: conjurada pelo custo iminente, pode ser anulada',
    3: 'teste: uma cópia do permanente entra sem marcadores de tempo e é criatura',
    4: 'teste: iminente 4 — entra com quatro marcadores de tempo, não é criatura enquanto tiver um, e perde um no início da sua etapa final',
  },
});
