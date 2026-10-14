// Nadier's Nightblade
// Whenever a token you control leaves the battlefield, each opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Nadier's Nightblade",
  faces: [{
    abilities: [
      // um disparo por ficha que sai, de qualquer jeito (morrer, ser exilada, sacrificada…)
      triggered(on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.token && e.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma ficha que você controla sai do campo, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {},
});
