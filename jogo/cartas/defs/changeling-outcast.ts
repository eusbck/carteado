// Changeling Outcast
// Changeling (This card is every creature type.)
// This creature can't block and can't be blocked.
import { changeling, defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Changeling Outcast',
  faces: [{
    abilities: [
      changeling(),
      staticAbility({
        rules: {
          canBlock: (c, bloqueador) => bloqueador !== c.source,
          canBeBlockedBy: (c, atacante) => atacante !== c.source,
        },
        text: 'Esta criatura não pode bloquear e não pode ser bloqueada.',
      }),
    ],
  }],
  rulings: {},
});
