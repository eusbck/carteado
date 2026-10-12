// High Score
// If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it
// instead.
// At the beginning of your end step, draw a card if you control a creature with the greatest power among creatures on
// the battlefield.
import { allCreatures, creaturesOf, defineCard, draw, on, power, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'High Score',
  faces: [{
    abilities: [
      // ruling 1: cada High Score soma mais um; ruling 2: vale para o que entra com marcadores
      staticAbility({
        rules: { countersBonus: (c, tipo, perm) => (tipo === '+1/+1' && perm.controller === c.you && perm.chars.types.includes('Creature') ? 1 : 0) },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados numa criatura que você controla, em vez disso são colocados nela esses marcadores mais um.',
      }),
      triggered(on.endStep('you'), function* (c) {
        const todas = allCreatures(c.g);
        if (!todas.length) return;
        const maior = Math.max(...todas.map((id) => power(c.g, id)));
        if (creaturesOf(c.g, c.you).some((id) => power(c.g, id) === maior)) yield* draw(c.g, c.you, 1);
      }, { text: 'No início da sua etapa final, compre uma carta se você controla uma criatura com a maior força entre as criaturas no campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: os marcadores +1/+1 postos numa criatura sua ganham mais um; com Corpsejack Menace, soma antes de dobrar',
    2: 'regra geral: CR 614.1 — entrar com marcadores também é substituído (motor/actions.ts countersAfterReplacements)',
    3: 'regra geral: CR 616.1 — a ordem das substituições é de quem controla a criatura; o motor soma antes de dobrar, que rende mais (motor/actions.ts countersAfterReplacements)',
  },
});