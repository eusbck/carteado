// Void Winnower
// Your opponents can't cast spells with even mana values. (Zero is even.)
// Your opponents can't block with creatures with even mana values.
import { controllerOf, defineCard, manaValue, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Void Winnower',
  faces: [{
    abilities: [
      // rulings 1-2, 4: o valor de mana (com o X escolhido; virada para baixo vale 0), não o custo pago
      staticAbility({
        rules: { cantCastSpell: (c, p, _magica, valor) => c.g.isOpponent(c.you, p) && valor % 2 === 0 },
        text: 'Os seus oponentes não podem conjurar mágicas com valor de mana par. (Zero é par.)',
      }),
      // rulings 3-4: no campo X vale 0; a criatura virada para baixo tem valor de mana 0
      staticAbility({
        rules: { canBlock: (c, bloqueadora) => !(c.g.isOpponent(c.you, controllerOf(c.g, bloqueadora)) && (c.g.state.objects[bloqueadora].faceDown ? 0 : manaValue(c.g, bloqueadora)) % 2 === 0) },
        text: 'Os seus oponentes não podem bloquear com criaturas com valor de mana par.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — aumentos e reduções de custo não mudam o valor de mana (motor/stack.ts)',
    2: 'regra geral: CR 202.3e — com {X} no custo vale o X escolhido ao conjurar (motor/stack.ts cantCastSpell)',
    3: 'regra geral: CR 202.3e — no campo X vale 0 (motor/chars.ts manaValue)',
    4: 'regra geral: CR 708.2a — mágica ou criatura virada para baixo tem valor de mana 0 e fica proibida',
    5: 'teste: os oponentes não conjuram mágicas de valor par nem bloqueiam com criaturas de valor par',
  },
});
