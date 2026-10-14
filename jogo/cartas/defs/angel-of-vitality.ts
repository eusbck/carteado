// Angel of Vitality
// Flying
// If you would gain life, you gain that much life plus 1 instead.
// This creature gets +2/+2 as long as you have 25 or more life.
import { defineCard, keyword, selfGets, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Angel of Vitality',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 614.1a: substituição em cada evento de ganhar vida (rulings 1-4)
      staticAbility({ rules: { lifeGainBonus: (c, p) => (p === c.you ? 1 : 0) }, text: 'Se você fosse ganhar vida, em vez disso ganha essa quantidade mais 1.' }),
      selfGets((c) => (c.g.state.players[c.you].life >= 25 ? [{ k: 'pt', p: 2, t: 2 }] : []), 'Esta criatura recebe +2/+2 enquanto você tiver 25 ou mais pontos de vida.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 616.1 — cada Angel of Vitality soma 1 (motor: lifeGainBonus somado)',
    2: 'teste: soma 1 a cada evento de ganhar vida, de qualquer tamanho',
    3: 'regra geral: CR 119.9 — "para cada" é um evento só de ganhar vida',
    4: 'regra geral: CR 119.10 — cada criatura com vínculo com a vida é um evento separado (motor/actions.ts dealDamage)',
    5: 'regra geral: CR 704.3 — o bônus de vida vale antes de conferir o dano letal (motor/sba.ts)',
    6: 'teste: abaixo de 25 de vida perde o +2/+2',
    7: 'não se aplica: não há partidas de Dois Gigantes',
    8: 'teste: com 40 de vida (Commander), recebe +2/+2',
    9: 'não se aplica: não há partidas de Dois Gigantes',
  },
});
