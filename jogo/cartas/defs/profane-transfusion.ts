// Profane Transfusion
// Two target players exchange life totals. You create an X/X colorless Horror artifact creature token, where X is the
// difference between those players' life totals.
import { createTokens, defineCard, gainLife, hooks, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Profane Transfusion',
  faces: [{
    spell: {
      targets: [t.player(undefined, 'primeiro jogador alvo'), { ...t.player(undefined, 'segundo jogador alvo'), differentFrom: [0] }],
      *effect(c) {
        const s = c.g.state;
        const a = tgtPlayer(c, 0);
        const b = tgtPlayer(c, 1);
        // CR 701.12a: sem os dois jogadores, não há troca
        if (a !== null && b !== null && s.players[a].life !== s.players[b].life) {
          const [menor, maior] = s.players[a].life < s.players[b].life ? [a, b] : [b, a];
          const diferenca = s.players[maior].life - s.players[menor].life;
          // ruling 2 (CR 119.7): quem não pode ganhar vida não troca por um total maior; aí nada é trocado
          const podeGanhar = !hooks(c.g, 'cantGainLife').some((h) => h.fn(h.ctx, menor));
          if (podeGanhar) {
            // ruling 1 (CR 701.12c): cada um ganha ou perde o que falta para chegar ao total anterior do outro
            gainLife(c.g, menor, diferenca, c.source);
            loseLife(c.g, maior, diferenca, c.source);
            c.g.log(`${s.players[a].name} e ${s.players[b].name} trocam os totais de vida.`, { rule: '701.12c' });
          }
        }
        // ruling 3: a diferença depois da troca
        const x = a !== null && b !== null ? Math.abs(s.players[a].life - s.players[b].life) : 0;
        yield* createTokens(c.g, c.you, { copyOf: { def: 'Horror X/X', face: 0, except: { power: x, toughness: x } } }, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: os dois jogadores trocam os totais de vida e você cria um Horror X/X com a diferença',
    2: 'teste: CR 119.7: quem não pode ganhar vida não troca por um total maior, e a ficha usa a diferença que ficou',
    3: 'teste: CR 119.7: quem não pode ganhar vida não troca por um total maior, e a ficha usa a diferença que ficou',
  },
});
