// Cursed Totem
// Activated abilities of creatures can't be activated.
import { defineCard, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Cursed Totem',
  faces: [{
    abilities: [
      staticAbility({
        // ruling 1: só criaturas no campo (ciclagem e desenterrar das cartas de criatura continuam); ruling 2: inclui as de
        // mana; ruling 4: o Veículo tripula, e depois de virar criatura as habilidades dele param
        rules: { cantActivate: (c, _p, fonte) => c.g.state.objects[fonte]?.zone === 'battlefield' && isCreature(c.g, fonte) },
        text: 'Habilidades ativadas de criaturas não podem ser ativadas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a ciclagem de uma carta de criatura na mão continua',
    2: 'teste: a habilidade de mana de uma criatura também não pode ser ativada',
    3: 'regra geral: CR 602 — só habilidades ativadas; estáticas e desencadeadas continuam',
    4: 'regra geral: CR 702.122 — tripular é habilidade do Veículo que ainda não é criatura (motor/mecanicas.ts crew)',
    5: 'regra geral: CR 602.1 — habilidade ativada é a que tem dois-pontos',
  },
});
