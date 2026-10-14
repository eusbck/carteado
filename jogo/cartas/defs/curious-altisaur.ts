// Curious Altisaur
// Reach, vigilance
// Whenever a Dinosaur you control deals combat damage to a player, draw a card.
import { controllerOf, defineCard, draw, keywords, lkiChars, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Curious Altisaur',
  faces: [{
    abilities: [
      ...keywords('reach', 'vigilance'),
      // um gatilho por Dinosaur que causa dano de combate a um jogador
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you
        && !!lkiChars(c.g, e.source)?.subtypes.includes('Dinosaur') && (!c.g.state.objects[e.source] || controllerOf(c.g, e.source) === c.you)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um Dinosaur que você controla causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
