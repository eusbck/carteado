// Ad Nauseam
// Reveal the top card of your library and put that card into your hand. You lose life equal to its mana value. You may
// repeat this process any number of times.
import { defineCard, loseLife, manaValue, moveObjects, nameOf, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Ad Nauseam',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        for (let guarda = 0; guarda < 500; guarda++) {
          const topo = g.state.zones.library[c.you][0];
          if (topo === undefined) break;
          // ruling 2: {X} vale 0 no grimório (CR 107.3)
          const valor = manaValue(g, topo);
          const nome = nameOf(g, topo);
          g.log(`${g.state.players[c.you].name} revela ${nome}.`, { rule: '701.20' });
          yield* moveObjects(g, [{ id: topo, to: 'hand' }], 'effect');
          if (valor > 0) loseLife(g, c.you, valor, c.source);
          // ruling 1: decide a cada carta; ruling 3: pode continuar com 0 ou menos de vida (perde só ao parar, CR 704.5a)
          if (!g.state.zones.library[c.you].length) break;
          if (!(yield* yesNo(g, c.you, `Ad Nauseam: ${nome} custou ${valor} de vida (vida: ${g.state.players[c.you].life}). Revelar outra?`, 'Revelar outra', 'Parar'))) break;
        }
      },
    },
  }],
  rulings: {
    1: 'teste: revela uma de cada vez e decide se continua',
    2: 'regra geral: CR 107.3 — {X} vale 0 fora da pilha (motor/chars.ts)',
    3: 'teste: pode continuar com 0 ou menos de vida; perde o jogo ao parar',
  },
});
