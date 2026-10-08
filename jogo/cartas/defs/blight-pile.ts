// Blight Pile
// Defender
// {2}{B}, {T}: Each opponent loses X life, where X is the number of creatures with defender you control.
import { activated, controlledBy, defineCard, hasKw, isCreature, keyword, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Blight Pile',
  faces: [{
    abilities: [
      keyword('defender'),
      activated('{2}{B}, {T}', function* (c) {
        const x = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && hasKw(c.g, id, 'defender')).length;
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, x, c.source);
      }, { text: '{2}{B}, {T}: Cada oponente perde X de vida, onde X é o número de criaturas com defensor que você controla.' }),
    ],
  }],
  rulings: { 1: 'não se aplica: Gigante de Duas Cabeças está fora do escopo' },
});
