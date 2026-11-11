// Mirkwood Bats
// Flying
// Whenever you create or sacrifice a token, each opponent loses 1 life.
import { defineCard, keyword, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirkwood Bats',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => {
        // CR 111.2: criar uma ficha; CR 701.21: sacrificar uma (a ficha era sua ao ser sacrificada)
        if (e.type === 'token') return e.player === c.you;
        if (e.type === 'sacrifice') { const l = c.g.state.lki[e.old]; return e.player === c.you && !!l && l.obj.isToken; }
        return false;
      }), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que você cria ou sacrifica uma ficha, cada oponente perde 1 de vida.' }),
    ],
  }],
  rulings: {},
});
