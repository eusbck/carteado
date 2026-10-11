// Dread Summons
// Each player mills X cards. For each creature card put into a graveyard this way, you create a tapped 2/2 black Zombie
// creature token. (To mill a card, a player puts the top card of their library into their graveyard.)
import { createTokens, defineCard, isCreature, mill } from '../../motor/api.ts';

export default defineCard({
  name: 'Dread Summons',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        let criaturas = 0;
        for (const p of g.apnap()) {
          const moidas = yield* mill(g, p, c.x);
          // ruling 1: só conta a carta de criatura que chegou mesmo a um cemitério
          criaturas += moidas.filter((id) => g.state.objects[id]?.zone === 'graveyard' && isCreature(g, id)).length;
        }
        if (criaturas > 0) yield* createTokens(g, c.you, 'Zombie 2/2', criaturas, { tapped: true });
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador mói X; uma ficha de Zombie 2/2 virada para cada carta de criatura que foi para um cemitério',
  },
});
