// Tippy-Toe, Terrific Partner
// If you would create one or more tokens, instead create those tokens plus an additional Food token. (It's an artifact
// with "{2}, {T}, Sacrifice this token: You gain 3 life.")
// At the beginning of your end step, if you gained life this turn, draw a card.
import { defineCard, draw, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Tippy-Toe, Terrific Partner',
  faces: [{
    abilities: [
      // CR 614.1a: uma Food a mais por evento de criação de fichas
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.length ? null : {
            label: 'Tippy-Toe: mais uma Food',
            *replace(e) { return { ...e, tokens: [...e.tokens, { de: e.tokens[0].de, def: 'Food' }] }; },
          }),
        },
        text: 'Se você fosse criar uma ou mais fichas, em vez disso crie essas fichas mais uma ficha Food.',
      }),
      // CR 603.4: "se" interveniente
      triggered(on.endStep('you'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        text: 'No início da sua etapa final, se você ganhou vida neste turno, compre uma carta.',
      }),
    ],
  }],
  rulings: {},
});
