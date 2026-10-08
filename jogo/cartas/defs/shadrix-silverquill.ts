// Shadrix Silverquill
// Flying, double strike
// At the beginning of combat on your turn, you may choose two. Each mode must target a different player.
// • Target player creates a 2/1 white and black Inkling creature token with flying.
// • Target player draws a card and loses 1 life.
// • Target player puts a +1/+1 counter on each creature they control.
import { addCounters, createTokens, creaturesOf, defineCard, draw, keywords, loseLife, modal, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Shadrix Silverquill',
  faces: [{
    abilities: [
      ...keywords('flying', 'double strike'),
      triggered(on.beginCombat('you'), function* () { /* modos */ }, {
        // ruling 1: zero ou dois modos, cada um mirando um jogador diferente
        modes: modal(0, 2, [
          {
            text: 'O jogador alvo cria uma ficha de criatura Inkling branca e preta 2/1 com voar',
            targets: [t.player(undefined, 'jogador alvo (Inkling)')],
            *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* createTokens(c.g, p, 'Inkling', 1); },
          },
          {
            text: 'O jogador alvo compra uma carta e perde 1 de vida',
            targets: [t.player(undefined, 'jogador alvo (compra e perde 1)')],
            *effect(c) { const p = tgtPlayer(c); if (p !== null) { yield* draw(c.g, p, 1); loseLife(c.g, p, 1, c.source); } },
          },
          {
            text: 'O jogador alvo coloca um marcador +1/+1 em cada criatura que controla',
            targets: [t.player(undefined, 'jogador alvo (marcadores)')],
            // ruling 2: pode mirar quem não tem criaturas
            *effect(c) { const p = tgtPlayer(c); if (p !== null) for (const id of creaturesOf(c.g, p)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, p); },
          },
        ], { differentPlayers: true, counts: [0, 2] }),
        text: 'No início do combate no seu turno, você pode escolher dois modos, cada um mirando um jogador diferente.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: zero ou dois modos, nunca um; jogadores diferentes',
    2: 'teste: o terceiro modo pode mirar quem não tem criaturas',
  },
});
