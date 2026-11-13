// Horizon Explorer
// Lands you control enter untapped.
// Whenever you attack a player, create a Lander token. (It's an artifact with "{2}, {T}, Sacrifice this token: Search
// your library for a basic land card, put it onto the battlefield tapped, then shuffle.")
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';
import { terrenosEntramDesvirados } from '../terras.ts';

export default defineCard({
  name: 'Horizon Explorer',
  faces: [{
    abilities: [
      // ruling 1: aplicada por último, o terreno entra desvirado
      terrenosEntramDesvirados(),
      // ruling 2: um disparo por jogador atacado
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.filter((a) => a.target.kind === 'player').map((a) => a.target.id))];
        return jogadores.length ? jogadores.map((jogador) => ({ jogador })) : false;
      }), function* (c) { yield* createTokens(c.g, c.you, 'Lander', 1); }, {
        text: 'Sempre que você ataca um jogador, crie uma ficha de Lander.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o terreno que entraria virado entra desvirado',
    2: 'teste: atacando dois jogadores, cria duas fichas de Lander',
  },
});
