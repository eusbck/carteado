// Graaz, Unstoppable Juggernaut
// Juggernauts you control attack each combat if able.
// Juggernauts you control can't be blocked by Walls.
// Other creatures you control have base power and toughness 5/3 and are Juggernauts in addition to their other creature types.
import { and, anthem, controllerOf, defineCard, is, isSubtype, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Graaz, Unstoppable Juggernaut",
  faces: [{
    abilities: [
      staticAbility({ rules: { attacksIfAble: (c, id) => controllerOf(c.g, id) === c.you && isSubtype(c.g, id, 'Juggernaut'), canBeBlockedBy: (c, attacker, blocker) => !(controllerOf(c.g, attacker) === c.you && isSubtype(c.g, attacker, 'Juggernaut') && isSubtype(c.g, blocker, 'Wall')) }, text: 'Seus Juggernauts atacam a cada combate se puderem e não podem ser bloqueados por Walls.' }),
      anthem(and(is.creature, is.yours, is.other), () => [{ k: 'addTypes', subtypes: ['Juggernaut'] }, { k: 'setPT', p: 5, t: 3 }], 'Suas outras criaturas têm F/R básicas 5/3 e são também Juggernauts.'),
    ]
  }],
  rulings: {
    "1": "CR 613.6: teste: perder habilidades após começar o efeito de tipo conserva 5/3 e Juggernaut, mas perde as exigências e a restrição de Walls."
  },
});
