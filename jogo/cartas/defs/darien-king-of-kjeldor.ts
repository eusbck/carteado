// Darien, King of Kjeldor
// Whenever you're dealt damage, you may create that many 1/1 white Soldier creature tokens.
import { createTokens, defineCard, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Darien, King of Kjeldor',
  faces: [{
    abilities: [
      // dano simultâneo (de várias fontes) é um evento só: um disparo com o total (CR 603.2c, 120.4)
      triggered(on.batch((evs, c) => {
        const n = evs.reduce((s, e) => s + (e.type === 'damage' && e.target.kind === 'player' && e.target.id === c.you ? e.amount : 0), 0);
        return n > 0 ? { n } : false;
      }), function* (c) {
        const n = c.event.n as number;
        if (yield* yesNo(c.g, c.you, `Darien: criar ${n} ficha(s) Soldier 1/1?`)) yield* createTokens(c.g, c.you, 'Soldier', n);
      }, { text: 'Sempre que você recebe dano, você pode criar essa quantidade de fichas de criatura Soldier brancas 1/1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5a — com 0 de vida você perde antes de o gatilho resolver',
  },
});
