// Darkness
// Prevent all combat damage that would be dealt this turn.
import { defineCard, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: 'Darkness',
  faces: [{
    spell: {
      *effect(c) { ruleEffect(c, 'rule:preventAllCombatDamage', { kind: 'endOfTurn' }); },
    },
  }],
  rulings: {},
});