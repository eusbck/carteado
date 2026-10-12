// Ethereal Haze
// Prevent all damage that would be dealt by creatures this turn.
import { defineCard, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: 'Ethereal Haze',
  faces: [{ spell: { *effect(c) { ruleEffect(c, 'rule:preventDamageByCreatures', { kind: 'endOfTurn' }); } } }],
  rulings: {},
});