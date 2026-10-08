// Ominous Harvest
// Gravestorm (When you cast this spell, copy it for each permanent put into a graveyard from the battlefield this
// turn.)
// Target player draws a card and loses 1 life.
import { defineCard, draw, gravestorm, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Ominous Harvest',
  faces: [{
    abilities: [gravestorm()],
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        yield* draw(c.g, p, 1);
        loseLife(c.g, p, 1, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: cada cópia pode ter um novo alvo',
    2: 'teste: conta todos os permanentes, de qualquer jogador, inclusive fichas',
    3: 'regra geral: CR 707.10 — cópias não são conjuradas',
    4: 'regra geral: o gatilho pode ser anulado como qualquer habilidade (counter)',
    5: 'regra geral: cada cópia é anulada separadamente',
  },
});
