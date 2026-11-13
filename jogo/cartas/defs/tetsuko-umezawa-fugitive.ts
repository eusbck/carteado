// Tetsuko Umezawa, Fugitive
// Creatures you control with power or toughness 1 or less can't be blocked.
import { controllerOf, defineCard, isCreature, power, staticAbility, toughness } from '../../motor/api.ts';

export default defineCard({
  name: 'Tetsuko Umezawa, Fugitive',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          // CR 509.1b: vale ao declarar bloqueadores (ruling 1: mudar depois não desfaz o bloqueio)
          canBeBlockedBy: (c, atacante) => !(controllerOf(c.g, atacante) === c.you && isCreature(c.g, atacante)
            && (power(c.g, atacante) <= 1 || toughness(c.g, atacante) <= 1)),
        },
        text: 'As criaturas que você controla com força ou resistência 1 ou menos não podem ser bloqueadas.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 509.1 — a restrição vale só ao declarar bloqueadores; depois do bloqueio, a criatura continua bloqueada (motor/combat.ts)' },
});
