// Ghostly Prison
// Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Ghostly Prison',
  faces: [{
    abilities: [staticAbility({
      // ruling 2: só ataques a você; planeswalkers ficam de fora
      rules: { attackCost: (c, _a, alvo) => (alvo.kind === 'player' && alvo.id === c.you ? 2 : 0) },
      text: 'As criaturas não podem atacar você a menos que o controlador delas pague {2} para cada criatura dele que esteja atacando você.',
    })],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
    2: 'regra geral: CR 508.1h — o custo é só para atacar o jogador',
  },
});
