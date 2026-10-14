// Archangel of Tithes
// Flying
// As long as this creature is untapped, creatures can't attack you or planeswalkers you control unless their controller
// pays {1} for each of those creatures.
// As long as this creature is attacking, creatures can't block unless their controller pays {1} for each of those
// creatures.
import { controllerOf, defineCard, isAttacking, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Archangel of Tithes',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 508.1d, 508.1h: custo para atacar
      staticAbility({
        condition: (c) => !c.g.state.objects[c.source]?.tapped,
        rules: { attackCost: (c, _atacante, alvo) => (alvo.kind === 'player' ? (alvo.id === c.you ? 1 : 0) : (c.g.state.objects[alvo.id] && controllerOf(c.g, alvo.id) === c.you ? 1 : 0)) },
        text: 'Enquanto esta criatura estiver desvirada, as criaturas não podem atacar você nem os planeswalkers que você controla, a menos que o controlador delas pague {1} por criatura.',
      }),
      // CR 509.1d: custo para bloquear
      staticAbility({
        condition: (c) => isAttacking(c.g, c.source),
        rules: { blockCost: () => 1 },
        text: 'Enquanto esta criatura estiver atacando, as criaturas não podem bloquear, a menos que o controlador delas pague {1} por criatura.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 508.1d, 509.1c — uma exigência de atacar ou bloquear não obriga a pagar o custo (motor/combat.ts)' },
});
