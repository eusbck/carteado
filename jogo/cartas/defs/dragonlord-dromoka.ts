// Dragonlord Dromoka
// This spell can't be countered.
// Flying, lifelink
// Your opponents can't cast spells during your turn.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Dragonlord Dromoka',
  faces: [{
    cantBeCountered: true, // CR 113.6g: funciona na pilha
    abilities: [
      ...keywords('flying', 'lifelink'),
      staticAbility({
        text: 'Seus oponentes não podem conjurar mágicas durante o seu turno.',
        rules: { cantCastSpells: (c, p) => c.g.state.turn.active === c.you && c.g.isOpponent(c.you, p) },
      }),
    ],
  }],
  rulings: {},
});
