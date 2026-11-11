// Disallow
// Counter target spell, activated ability, or triggered ability. (Mana abilities can't be targeted.)
import { counter, defineCard, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Disallow',
  faces: [{
    spell: {
      targets: [{ what: 'stackObject', label: 'mágica, habilidade ativada ou habilidade desencadeada alvo' }],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 605.3 — habilidades de mana não usam a pilha e não podem ser alvo',
    2: 'regra geral: CR 701.6b — anular uma habilidade a remove da pilha; o custo pago não volta (motor/stack.ts counter)',
    3: 'regra geral: CR 701.6b — anular uma habilidade não afeta a fonte dela',
    4: 'regra geral: CR 701.6a — uma mágica que "não pode ser anulada" continua na pilha (motor/stack.ts counter)',
    5: 'regra geral: CR 113.7a — a habilidade anulada de uma fonte que já saiu não resolve',
    6: 'regra geral: CR 113.3d — habilidades estáticas não usam a pilha e não podem ser anuladas',
  },
});
