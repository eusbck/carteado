// Undead Augur
// Whenever this creature or another Zombie you control dies, you draw a card and lose 1 life.
import { defineCard, draw, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Undead Augur',
  faces: [{
    abilities: [
      // ruling 1: olha para trás (CR 603.10a): morrendo junto com outros Zombies, dispara por cada um
      triggered(on.dies((c, l, _old, e) => e.old === c.source || (l.subtypes.includes('Zombie') && l.controller === c.you)), function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que esta criatura ou outro Zombie que você controla morre, você compra uma carta e perde 1 de vida.' }),
    ],
  }],
  rulings: { 1: 'teste: CR 603.10a: morrendo junto com outros Zombies, dispara por cada um' },
});
