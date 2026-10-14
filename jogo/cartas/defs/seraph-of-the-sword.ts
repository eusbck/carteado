// Seraph of the Sword
// Flying
// Prevent all combat damage that would be dealt to this creature.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Seraph of the Sword',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 615.1a; ruling 1: a atribuição de dano (atropelar) continua considerando a resistência dela
      staticAbility({
        rules: { preventsDamage: (c, alvo, _fonte, combate) => combate && alvo.kind === 'obj' && alvo.id === c.source },
        text: 'Previna todo o dano de combate que seria causado a esta criatura.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 702.19b — com atropelar, o atacante ainda atribui dano letal a ela antes do resto (motor/combat.ts)' },
});
