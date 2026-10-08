// Exsanguinate
// Each opponent loses X life. You gain life equal to the life lost this way.
import { defineCard, gainLife, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Exsanguinate',
  faces: [{
    spell: {
      *effect(c) {
        let perdida = 0;
        for (const p of c.g.opponents(c.you)) perdida += loseLife(c.g, p, c.x, c.source);
        if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 119.4: pode perder mais vida do que tem; você ganha o total perdido',
  },
});
