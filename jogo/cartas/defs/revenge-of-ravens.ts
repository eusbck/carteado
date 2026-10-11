// Revenge of Ravens
// Whenever a creature attacks you or a planeswalker you control, that creature's controller loses 1 life and you gain 1
// life.
import { controllerOf, defineCard, gainLife, loseLife, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Revenge of Ravens',
  faces: [{
    abilities: [
      // um gatilho para cada criatura que ataca você ou um planeswalker seu
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => (a.target.kind === 'player' ? a.target.id === c.you : !!c.g.state.objects[a.target.id] && controllerOf(c.g, a.target.id) === c.you)).map(() => ({ atacante: e.player }))
        : false)), function* (c) {
        loseLife(c.g, c.event.atacante as PlayerId, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura ataca você ou um planeswalker que você controla, o controlador dessa criatura perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — os gatilhos resolvem antes do dano de combate; se o atacante perder a partida, não há dano',
  },
});
