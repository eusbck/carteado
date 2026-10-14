// Second Harvest
// For each token you control, create a token that's a copy of that permanent.
import { copiableValues, createTokens, defineCard } from '../../motor/api.ts';
import { fichasDe } from '../esquilos.ts';

export default defineCard({
  name: 'Second Harvest',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: copia os valores copiáveis (o que o efeito que criou a ficha definiu), sem marcadores nem estado
        // ruling 2: todas as fichas, não só as de criatura
        for (const id of fichasDe(c.g, c.you)) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: copia cada ficha que você controla, sem os marcadores e desvirada',
    2: 'teste: copia cada ficha que você controla, sem os marcadores e desvirada',
  },
});
