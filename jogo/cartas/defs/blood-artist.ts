// Blood Artist — Whenever this creature or another creature dies, target player loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Blood Artist',
  faces: [{
    abilities: [triggered(on.dies(() => true), function* (c) {
      const p = tgtPlayer(c);
      if (p !== null) loseLife(c.g, p, 1, c.source);
      gainLife(c.g, c.you, 1, c.source);
    }, { targets: [t.player()], text: 'Sempre que esta ou outra criatura morre, o jogador alvo perde 1 de vida e você ganha 1 de vida.' })],
  }],
  rulings: {
    1: "teste: CR 603.10a: dispara para cada criatura que morre junto com ele",
  },
});
