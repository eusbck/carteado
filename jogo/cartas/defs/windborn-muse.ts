// Windborn Muse
// Flying
// Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Windborn Muse',
  faces: [{
    abilities: [
      ...keywords('flying'),
      staticAbility({
        // ruling 1: só ataques a você; planeswalkers ficam de fora (CR 508.1h)
        rules: { attackCost: (c, _a, alvo) => (alvo.kind === 'player' && alvo.id === c.you ? 2 : 0) },
        text: 'As criaturas não podem atacar você a menos que o controlador delas pague {2} para cada criatura dele que esteja atacando você.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: atacar você custa {2} por criatura; sem pagar, não ataca',
  },
});
