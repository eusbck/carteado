// Mirkwood Bats
// Flying
// Whenever you create or sacrifice a token, each opponent loses 1 life.
import { defineCard, keyword, lkiObj, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirkwood Bats',
  faces: [{
    abilities: [
      keyword('flying'),
      // um gatilho por ficha criada e por ficha sacrificada
      triggered(on.custom((e, c) => (e.type === 'token' && e.player === c.you) || (e.type === 'sacrifice' && e.player === c.you && !!lkiObj(c.g, e.old)?.isToken)), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que você cria ou sacrifica uma ficha, cada oponente perde 1 ponto de vida.' }),
    ],
  }],
  rulings: {},
});
