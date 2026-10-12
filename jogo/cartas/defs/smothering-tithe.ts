// Smothering Tithe
// Whenever an opponent draws a card, that player may pay {2}. If the player doesn't, you create a Treasure token. (It's
// an artifact with "{T}, Sacrifice this token: Add one mana of any color.")
import { createTokens, defineCard, mayPay, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Smothering Tithe',
  faces: [{
    abilities: [
      // ruling 1: um gatilho por carta comprada; o jogador decide em cada um
      triggered(on.custom((e, c) => (e.type === 'draw' && c.g.isOpponent(c.you, e.player) ? { jogador: e.player } : false)), function* (c) {
        const p = c.event.jogador as number;
        const pagou = !c.g.state.players[p].left && (yield* mayPay(c, p, '{2}', `${c.g.state.players[c.you].name} não criar um Treasure (Smothering Tithe)`));
        if (!pagou) yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que um oponente compra uma carta, esse jogador pode pagar {2}. Se não pagar, você cria uma ficha Treasure.' }),
    ],
  }],
  rulings: { 1: 'teste: cada carta que o oponente compra dá um Treasure, a menos que ele pague {2}' },
});