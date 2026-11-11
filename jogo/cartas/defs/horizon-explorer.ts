// Horizon Explorer
// Lands you control enter untapped.
// Whenever you attack a player, create a Lander token.
import { createTokens, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Horizon Explorer',
  faces: [{
    abilities: [
      staticAbility({
        rules: { enterModifier: (c, ev, ch) => { if (ev.controller === c.you && ch.types.includes('Land')) ev.tapped = false; } },
        text: 'Os terrenos que você controla entram desvirados.',
      }),
      // um disparo por jogador atacado (CR 508.3d)
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.flatMap((a) => (a.target.kind === 'player' ? [a.target.id] : [])))];
        return jogadores.map((p) => ({ jogador: p }));
      }), function* (c) { yield* createTokens(c.g, c.you, 'Lander', 1); }, { text: 'Sempre que você ataca um jogador, crie uma ficha Lander.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.3d — atacar dois jogadores dá duas fichas',
    2: 'regra geral: CR 614.12 — vale também para terrenos que entrariam virados',
  },
});
