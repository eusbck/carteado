// Faerie Dreamthief
// Flying
// When this creature enters, surveil 1.
// {2}{B}, Exile this card from your graveyard: You draw a card and you lose 1 life.
import { activated, defineCard, draw, etb, keyword, lookAndArrange, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Faerie Dreamthief',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando esta criatura entra, vigiar 1.' }),
      activated('{2}{B}, Exile this card from your graveyard', function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      }, { zones: ['graveyard'], text: '{2}{B}, Exile esta carta do seu cemitério: Você compra uma carta e perde 1 ponto de vida.' }),
    ],
  }],
  rulings: {},
});
