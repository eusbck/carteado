// Portent
// Look at the top three cards of target player's library, then put them back in any order. You may have that player
// shuffle.
// Draw a card at the beginning of the next turn's upkeep.
import { defineAbility, defineCard, delayed, draw, nextUpkeepTrigger, shuffleLibrary, t, tgtPlayer, yesNo } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

// CR 603.7: gatilho atrasado criado na resolução
const compra = defineAbility('Portent:compra', nextUpkeepTrigger(function* (c) {
  yield* draw(c.g, c.you, 1);
}, 'No início da manutenção do próximo turno, compre uma carta.'));

export default defineCard({
  name: 'Portent',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p !== null) {
          // ruling 1: com menos de três cartas, olha o que houver
          yield* reordenaTopoDe(c, p, 3, 'Portent');
          if (yield* yesNo(c.g, c.you, `Portent: fazer ${c.g.state.players[p].name} embaralhar o grimório?`, 'Embaralhar', 'Não embaralhar')) shuffleLibrary(c.g, p);
        }
        delayed(c, compra.id!);
      },
    },
  }],
  rulings: {
    1: 'teste: com menos de três cartas no grimório, reordena o que houver e ninguém perde',
  },
});
