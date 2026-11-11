// Bloodthirsty Conqueror
// Flying, deathtouch
// Whenever an opponent loses life, you gain that much life. (Damage causes loss of life.)
import { defineCard, gainLife, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodthirsty Conqueror',
  faces: [{
    abilities: [
      keyword('flying'), keyword('deathtouch'),
      triggered(on.custom((e, c) => (e.type === 'lifeLoss' && c.g.isOpponent(c.you, e.player) && e.amount > 0 ? { amount: e.amount } : false)), function* (c) {
        gainLife(c.g, c.you, c.event.amount as number, c.source);
      }, { text: 'Sempre que um oponente perde vida, você ganha essa quantidade de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.3a — dano a um jogador o faz perder vida',
    2: 'regra geral: CR 603.2 — cada evento de perda dispara uma vez',
  },
});
