// Falkenrath Noble
// Flying
// Whenever this creature or another creature dies, target player loses 1 life and you gain 1 life.
import { defineCard, gainLife, keyword, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Falkenrath Noble',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: qualquer criatura, de qualquer jogador; morrendo junto com outras, dispara para cada uma (CR 603.10a)
      triggered(on.dies(() => true), function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { targets: [t.player()], text: 'Sempre que esta criatura ou outra criatura morre, o jogador alvo perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: morrendo junto com outra criatura, dispara para cada uma',
  },
});
