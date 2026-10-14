// Sphere of Safety
// Creatures can't attack you or planeswalkers you control unless their controller pays {X} for each of those creatures,
// where X is the number of enchantments you control.
import { controllerOf, defineCard, isType, staticAbility } from '../../motor/api.ts';
import { encantamentosDe } from '../milagres.ts';

export default defineCard({
  name: 'Sphere of Safety',
  faces: [{
    abilities: [staticAbility({
      rules: {
        attackCost: (c, _a, alvo) => {
          const protegido = alvo.kind === 'player' ? alvo.id === c.you : isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you;
          return protegido ? encantamentosDe(c.g, c.you).length : 0;
        },
      },
      text: 'As criaturas não podem atacar você nem os planeswalkers que você controla a menos que o controlador delas pague {X} para cada uma dessas criaturas, onde X é o número de encantamentos que você controla.',
    })],
  }],
  rulings: {
    1: 'regra geral: CR 508.1d — com custo para atacar, a criatura que "ataca se puder" não é obrigada a atacar (motor/combat.ts)',
  },
});
