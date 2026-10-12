// Reconnaissance Mission
// Whenever a creature you control deals combat damage to a player, you may draw a card.
// Cycling {2} ({2}, Discard this card: Draw a card.)
import { controllerOf, cycling, defineCard, draw, isCreature, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Reconnaissance Mission',
  faces: [{
    abilities: [
      // ruling 1: um gatilho para cada criatura sua que causa dano; uma carta por gatilho, seja qual for o dano
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source] && isCreature(c.g, e.source) && controllerOf(c.g, e.source) === c.you), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Reconnaissance Mission: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, você pode comprar uma carta.' }),
      cycling('{2}'),
    ],
  }],
  rulings: { 1: 'teste: um gatilho para cada criatura sua que causa dano de combate a um jogador, uma carta por gatilho' },
});