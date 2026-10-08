// Cryptbreaker
// {1}{B}, {T}, Discard a card: Create a 2/2 black Zombie creature token.
// Tap three untapped Zombies you control: You draw a card and lose 1 life.
import { activated, createTokens, defineCard, draw, isSubtype, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Cryptbreaker',
  faces: [{
    abilities: [
      activated('{1}{B}, {T}, Discard a card', function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1);
      }, { text: '{1}{B}, {T}, Descarte uma carta: Crie uma ficha de criatura Zumbi preta 2/2.' }),
      // ruling 1 / CR 302.6: virar criaturas como custo não é {T}; servem o próprio Cryptbreaker e Zumbis que acabaram
      // de chegar
      activated([{ k: 'tapCreatures', n: 3, includeSelf: true, label: 'Zumbis desvirados', filter: (c, id) => isSubtype(c.g, id, 'Zombie') }], function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      }, { text: 'Vire três Zumbis desvirados que você controla: Você compra uma carta e perde 1 ponto de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode virar o próprio Cryptbreaker e Zumbis com enjoo de invocação',
  },
});
