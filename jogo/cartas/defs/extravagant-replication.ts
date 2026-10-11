// Extravagant Replication
// At the beginning of your upkeep, create a token that's a copy of another target nonland permanent you control.
import { and, copiableValues, createTokens, defineCard, is, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Extravagant Replication',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        const id = tgt(c);
        // CR 707.2: a ficha copia os valores copiáveis do permanente
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, {
        targets: [t.nonlandPermanent(and(is.yours, is.other), 'outro permanente não terreno alvo que você controla')],
        text: 'No início da sua manutenção, crie uma ficha que é uma cópia de outro permanente não terreno alvo que você controla.',
      }),
    ],
  }],
  rulings: {},
});
