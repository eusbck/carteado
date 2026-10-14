// Ripjaw Raptor
// Enrage — Whenever this creature is dealt damage, draw a card.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ripjaw Raptor',
  faces: [{
    abilities: [
      // dano simultâneo de várias fontes é um evento só: dispara uma vez (ruling 1); dispara mesmo com dano letal (ruling 2)
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source && e.amount > 0)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Enfurecer — Sempre que esta criatura sofre dano, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: bloqueada por duas criaturas ao mesmo tempo, compra uma carta só',
    2: 'teste: com dano letal, dispara e compra mesmo assim',
  },
});
