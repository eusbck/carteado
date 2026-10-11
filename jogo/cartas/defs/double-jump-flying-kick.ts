// Double Jump // Flying Kick (dividida com fusão)
// Double Jump {1}{U} — Instant
// Put a flying counter on target creature you control. Until end of turn, it has base power and toughness 5/5.
// Fuse (You may cast one or both halves of this card from your hand.)
// Flying Kick {1}{R} — Instant
// Target creature you control deals damage equal to its power to target creature an opponent controls.
// Fuse (You may cast one or both halves of this card from your hand.)
import { addCounters, dealDamage, defineCard, is, power, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Double Jump // Flying Kick',
  faces: [
    {
      spell: {
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        *effect(c) {
          const id = tgt(c);
          if (id === null) return;
          // marcador de voar (CR 122.1b) e força e resistência base 5/5 até o fim do turno (camada 7b)
          addCounters(c.g, { kind: 'obj', id }, 'flying', 1, c.you);
          untilEndOfTurn(c, [id], [{ k: 'setPT', p: 5, t: 5 }]);
        },
      },
    },
    {
      spell: {
        targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(is.opponents, 'criatura alvo que um oponente controla')],
        *effect(c) {
          // as duas precisam continuar alvos legais (CR 608.2b: sem a que causa ou sem a que recebe, não há dano)
          const fonte = tgt(c, 0);
          const alvo = tgt(c, 1);
          if (fonte === null || alvo === null) return;
          dealDamage(c.g, [{ source: fonte, target: { kind: 'obj', id: alvo }, amount: power(c.g, fonte), combat: false }]);
        },
      },
    },
  ],
  rulings: {},
});
