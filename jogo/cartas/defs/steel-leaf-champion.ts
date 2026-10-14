// Steel Leaf Champion
// This creature can't be blocked by creatures with power 2 or less.
import { defineCard, power, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Steel Leaf Champion',
  faces: [{
    abilities: [
      // restrição de bloqueio (CR 509.1b): só na declaração; depois, mudar a força do bloqueador não desfaz (ruling 1)
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || power(c.g, bloqueador) >= 3 },
        text: 'Esta criatura não pode ser bloqueada por criaturas com força 2 ou menos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1b — as restrições de bloqueio só são conferidas na declaração (motor/combat.ts validateBlocks)',
  },
});
