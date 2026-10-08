// Vengeful Dead
// Whenever this creature or another Zombie dies, each opponent loses 1 life.
import { defineCard, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vengeful Dead',
  faces: [{
    abilities: [
      // qualquer Zombie, de qualquer jogador; olha para trás (CR 603.10a)
      triggered(on.dies((c, l, _old, e) => e.old === c.source || l.subtypes.includes('Zombie')), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que esta criatura ou outro Zombie morre, cada oponente perde 1 de vida.' }),
    ],
  }],
  rulings: {},
});
