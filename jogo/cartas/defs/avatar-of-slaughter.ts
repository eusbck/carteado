// Avatar of Slaughter
// All creatures have double strike and attack each combat if able.
import { defineCard, is, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Avatar of Slaughter',
  faces: [{
    abilities: [
      // ruling 1: a exigência de atacar segue as regras de sempre (virada, enjoo de invocação e custos a dispensam)
      staticAbility({
        affects: (c, o) => is.creature(c, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'double strike' }],
        rules: { attacksIfAble: (c, id) => isCreature(c.g, id) },
        text: 'Todas as criaturas têm golpe duplo e atacam a cada combate se puderem.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.1d — a exigência de atacar não vale para quem não pode atacar nem obriga a pagar custos (motor/combat.ts requirements)',
  },
});