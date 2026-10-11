// Death by Dragons
// Each player other than target player creates a 5/5 red Dragon creature token with flying.
import { createTokens, defineCard, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Death by Dragons',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        // ruling 1: sem o alvo, a mágica não resolve (CR 608.2b); ruling 2: só o jogador alvo fica sem Dragon
        const alvo = tgtPlayer(c);
        if (alvo === null) return;
        for (const p of c.g.apnap().filter((q) => q !== alvo)) yield* createTokens(c.g, p, 'Dragon 5/5', 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve (motor/stack.ts)',
    2: 'teste: cada jogador que não o alvo cria um Dragon 5/5 vermelho com voar',
  },
});