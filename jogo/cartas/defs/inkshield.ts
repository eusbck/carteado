// Inkshield
// Prevent all combat damage that would be dealt to you this turn. For each 1 damage prevented this way, create a 2/1
// white and black Inkling creature token with flying.
import { createTokens, defineCard, ruleEffect } from '../../motor/api.ts';
import { defineFn } from '../../motor/defs.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

// CR 615.5: as fichas são criadas logo depois da prevenção (motor/combat.ts)
const FICHAS = 'Inkshield:fichas';
defineFn(FICHAS, function* (g: G, p: PlayerId, n: number) { yield* createTokens(g, p, 'Inkling', n); });

export default defineCard({
  name: 'Inkshield',
  faces: [{
    spell: {
      *effect(c) {
        ruleEffect(c, 'rule:preventCombatDamageToPlayer', { kind: 'endOfTurn' }, { players: [c.you], params: { depois: FICHAS } });
      },
    },
  }],
  rulings: { 1: 'regra geral: CR 616.1 — o jogador afetado escolhe a ordem das prevenções' },
});
