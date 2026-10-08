// Painful Truths
// Converge — You draw X cards and lose X life, where X is the number of colors of mana spent to cast this spell.
import { defineCard, draw, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Painful Truths',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1, 5: cópia ou conjurada sem pagar gasta 0 cores
        const x = c.manaSpent?.colors ?? 0;
        if (x <= 0) return;
        yield* draw(c.g, c.you, x);
        loseLife(c.g, c.you, x, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia não teve mana gasta',
    2: 'teste: três cores gastas, três cartas',
    3: 'regra geral: CR 601.2f — mana de custos adicionais conta',
    4: 'regra geral: CR 601.2f — não dá para pagar a mais só para gastar cores',
    5: 'regra geral: CR 118.9 — sem pagar, nenhuma cor gasta',
  },
});
