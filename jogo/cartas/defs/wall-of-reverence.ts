// Wall of Reverence
// Defender, flying
// At the beginning of your end step, you may gain life equal to the power of target creature you control.
import { defineCard, gainLife, is, keywords, on, power, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Wall of Reverence',
  faces: [{
    abilities: [
      ...keywords('defender', 'flying'),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const n = Math.max(0, power(c.g, id)); // ruling 1: com os efeitos "até o fim do turno" ainda valendo
        if (n > 0 && (yield* yesNo(c.g, c.you, `Wall of Reverence: ganhar ${n} de vida?`))) gainLife(c.g, c.you, n, c.source);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'No início da sua etapa final, você pode ganhar vida igual à força da criatura alvo que você controla.' }),
    ],
  }],
  rulings: { 1: 'teste: força modificada até o fim do turno ainda vale na etapa final' },
});
