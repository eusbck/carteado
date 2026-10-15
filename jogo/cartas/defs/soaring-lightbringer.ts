// Soaring Lightbringer
// Flying
// Other enchantment creatures you control have flying.
// Whenever you attack a player, create a 1/1 white Glimmer enchantment creature token that's tapped and attacking that
// player.
import { and, anthem, createTokens, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Soaring Lightbringer',
  faces: [{
    abilities: [
      keyword('flying'),
      anthem(and(is.creature, is.enchantment, is.yours, is.other), () => [{ k: 'addKeyword', kw: 'flying' }], 'As outras criaturas encantamento que você controla têm voar.'),
      // ruling 1: um gatilho para cada jogador atacado
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.filter((a) => a.target.kind === 'player').map((a) => a.target.id as PlayerId))];
        return jogadores.map((jogador) => ({ jogador }));
      }), function* (c) {
        const jogador = c.event.jogador as PlayerId;
        if (c.g.state.players[jogador]?.left) return;
        yield* createTokens(c.g, c.you, 'Glimmer', 1, { tapped: true, attacking: { kind: 'player', id: jogador } });
      }, { text: 'Sempre que você ataca um jogador, crie uma ficha de criatura encantamento Glimmer 1/1 branca virada e atacando esse jogador.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacando dois jogadores, cria uma ficha atacando cada um',
  },
});
