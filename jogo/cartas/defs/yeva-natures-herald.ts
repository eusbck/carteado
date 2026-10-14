// Yeva, Nature's Herald
// Flash (You may cast this spell any time you could cast an instant.)
// You may cast green creature spells as though they had flash.
import { chars, defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Yeva, Nature's Herald",
  faces: [{
    abilities: [
      keyword('flash'),
      // vale para cartas de criatura verdes de qualquer zona de onde você possa conjurá-las (ruling 2); os custos são
      // pagos normalmente (ruling 1)
      staticAbility({
        rules: { castAsThoughFlash: (c, jogador, carta) => jogador === c.you && chars(c.g, carta).types.includes('Creature') && chars(c.g, carta).colors.includes('G') },
        text: 'Você pode conjurar mágicas de criatura verdes como se tivessem lampejo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com Yeva, conjura criatura verde no turno do oponente; sem ela, ou não verde, não',
    2: 'regra geral: CR 702.8a — a permissão vale onde a carta puder ser conjurada (motor/priority.ts castAsThoughFlash)',
  },
});
