// Challenger Troll
// Each creature you control with power 4 or greater can't be blocked by more than one creature.
import { controllerOf, defineCard, power, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Challenger Troll',
  faces: [{
    abilities: [
      // restrição de bloqueio (CR 509.1b), conferida na declaração; vale para ela mesma (ruling 1). Depois de declarado,
      // mudar a força não desfaz o bloqueio (ruling 2)
      staticAbility({
        rules: { maxBlockers: (c, atacante) => (controllerOf(c.g, atacante) === c.you && power(c.g, atacante) >= 4 ? 1 : null) },
        text: 'Cada criatura com força 4 ou mais que você controla não pode ser bloqueada por mais de uma criatura.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura com força 4 ou mais (ela mesma também) não pode ser bloqueada por duas; a de força menor pode',
    2: 'regra geral: CR 509.1b — as restrições só são conferidas na declaração de bloqueadores (motor/combat.ts validateBlocks)',
    3: 'teste: com ameaçar e força 4 ou mais, não pode ser bloqueada',
  },
});
