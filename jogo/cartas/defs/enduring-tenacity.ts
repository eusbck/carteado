// Enduring Tenacity
// Whenever you gain life, target opponent loses that much life.
// When Enduring Tenacity dies, if it was a creature, return it to the battlefield under its owner's control. It's an
// enchantment. (It's not a creature.)
import { defineCard, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';
import { voltaComoEncantamento } from '../sephiroth.ts';

export default defineCard({
  name: 'Enduring Tenacity',
  faces: [{
    abilities: [
      // rulings 2-3: um gatilho por evento de ganho de vida
      triggered(on.youGainLife(), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, c.event.amount as number, c.source);
      }, { targets: [t.opponent()], text: 'Sempre que você ganha vida, o oponente alvo perde essa quantidade de vida.' }),
      ...voltaComoEncantamento('Enduring Tenacity'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 104.4b — uma repetição obrigatória continua até alguém vencer ou quebrá-la (motor)',
    2: 'teste: ganhar vida faz o oponente alvo perder essa quantidade',
    3: 'regra geral: CR 119.9 — ganhar vida "para cada" é um evento só (motor/actions.ts gainLife)',
    4: 'não se aplica: Gigante de Duas Cabeças não é jogado aqui',
    5: 'teste: ao morrer, volta como encantamento que não é criatura, sem tipos de criatura',
    6: 'regra geral: CR 111.7 — a ficha deixa de existir no cemitério e não volta (motor)',
    7: 'teste: ao morrer, volta como encantamento que não é criatura, sem tipos de criatura',
  },
});
