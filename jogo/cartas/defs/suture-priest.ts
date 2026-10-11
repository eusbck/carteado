// Suture Priest
// Whenever another creature you control enters, you may gain 1 life.
// Whenever a creature an opponent controls enters, you may have that player lose 1 life.
import { and, defineCard, gainLife, is, loseLife, on, triggered, yesNo } from '../../motor/api.ts';
import { entraOutraCriaturaSua } from '../miku.ts';

export default defineCard({
  name: 'Suture Priest',
  faces: [{
    abilities: [
      triggered(entraOutraCriaturaSua(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Suture Priest: ganhar 1 de vida?')) gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que outra criatura que você controla entra, você pode ganhar 1 de vida.' }),
      // "esse jogador": quem controlava a criatura quando ela entrou
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.creature, is.opponents)(c, e.obj) ? { jogador: e.controller } : false)), function* (c) {
        const p = c.event.jogador as number;
        if (c.g.state.players[p].left) return;
        if (yield* yesNo(c.g, c.you, `Suture Priest: fazer ${c.g.state.players[p].name} perder 1 de vida?`)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que uma criatura que um oponente controla entra, você pode fazer esse jogador perder 1 de vida.' }),
    ],
  }],
  rulings: {},
});