// Replication Technique
// Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may
// choose new targets for their copies.)
// Create a token that's a copy of target permanent you control.
import { and, copiableValues, createTokens, defineCard, demonstrate, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Replication Technique',
  faces: [{
    abilities: [demonstrate()],
    spell: {
      targets: [t.permanent(and(is.yours), 'permanente alvo que você controla')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1); },
    },
  }],
  rulings: {
    1: 'teste: o oponente copia escolhendo um permanente dele',
    2: 'regra geral: CR 702.144a — o oponente escolhido copia logo em seguida',
    3: 'regra geral: a cópia do oponente resolve primeiro (testado em Creative Technique)',
    4: 'regra geral: CR 702.144a — a escolha é feita na resolução do gatilho',
    5: 'regra geral: sem copiar, ninguém copia (testado em Creative Technique)',
  },
});
