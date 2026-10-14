// Edric, Spymaster of Trest
// Whenever a creature deals combat damage to one of your opponents, its controller may draw a card.
import { chars, defineCard, draw, on, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Edric, Spymaster of Trest',
  faces: [{
    abilities: [
      // uma vez por criatura que causa dano de combate a um oponente seu; quem decide comprar é o controlador dela
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || !c.g.isOpponent(c.you, e.target.id)) return false;
        const ch = c.g.state.objects[e.source] ? chars(c.g, e.source) : c.g.state.lki[e.source]?.chars;
        return ch?.types.includes('Creature') ? { quem: e.controller } : false;
      }), function* (c) {
        const quem = c.event.quem as PlayerId;
        if (c.g.state.players[quem].left) return;
        if (yield* yesNo(c.g, quem, 'Edric, Spymaster of Trest: comprar uma carta?')) yield* draw(c.g, quem, 1);
      }, { text: 'Sempre que uma criatura causa dano de combate a um dos seus oponentes, o controlador dela pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: banimento no Duel Commander, outro formato',
    2: 'teste: a criatura de um oponente que causa dano a outro oponente faz o controlador dela poder comprar',
    3: 'teste: quando uma criatura sua causa dano de combate a um oponente, você pode comprar',
  },
});
