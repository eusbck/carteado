// Haddad, o Taxad (carta própria da mesa)
// Whenever an opponent casts their second spell each turn, that player may pay {1}. If they don't, you create a
// Treasure token.
import { createTokens, defineCard, mayPay, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Haddad, o Taxad',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player]?.spellsCast === 2 ? { jogador: e.player } : false)), function* (c) {
        const p = c.event.jogador as PlayerId;
        if (c.g.state.players[p].left) return;
        if (yield* mayPay(c, p, '{1}', 'Haddad, o Taxad: pagar para o oponente não criar um Tesouro')) return;
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que um oponente conjura a segunda mágica dele em um turno, aquele jogador pode pagar {1}. Se não pagar, você cria uma ficha de Tesouro.' }),
    ],
  }],
  rulings: {},
});
