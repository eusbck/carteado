// Splinter, Hamato Yoshi
// Sneak {B} (You may cast this spell for {B} if you also return an unblocked attacker you control to hand during the
// declare blockers step. He enters tapped and attacking.)
// Menace (This creature can't be blocked except by two or more creatures.)
// Other Ninjas you control get +1/+1.
import { and, anthem, defineCard, is, keyword, sneak } from '../../motor/api.ts';

const furtivo = sneak('{B}');

export default defineCard({
  name: 'Splinter, Hamato Yoshi',
  faces: [{
    // CR 702.190 (motor/conjurar-alternativo.ts)
    altCosts: [furtivo.altCost],
    abilities: [
      furtivo.ability,
      keyword('menace'),
      anthem(and(is.creature, is.yours, is.other, is.subtype('Ninja')), () => [{ k: 'pt', p: 1, t: 1 }], 'Os outros Ninjas que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {
    1: 'teste: pelo sneak, entra virado e atacando quem a criatura devolvida atacava',
    2: 'regra geral: CR 702.190b, 508.4 — não foi declarado atacante (cartas/defs/dark-leo-shredder.test.ts)',
    3: 'regra geral: CR 702.190a — só na sua etapa de declarar bloqueadores (cartas/defs/dark-leo-shredder.test.ts)',
  },
});
