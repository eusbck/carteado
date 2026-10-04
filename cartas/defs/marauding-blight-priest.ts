// Marauding Blight-Priest
// Whenever you gain life, each opponent loses 1 life.
import { defineCard, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Marauding Blight-Priest',
  faces: [{
    abilities: [triggered(on.youGainLife(), function* (c) {
      for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
    }, { text: 'Sempre que você ganha vida, cada oponente perde 1 de vida.' })],
  }],
  rulings: {
    1: 'teste: dispara uma vez por evento de ganho de vida',
    2: 'teste: ganho "para cada" é um evento só',
    3: 'não se aplica: Gigante de Duas Cabeças está fora do escopo',
    4: 'teste: duas criaturas com vínculo com a vida causando dano ao mesmo tempo disparam duas vezes',
  },
});
