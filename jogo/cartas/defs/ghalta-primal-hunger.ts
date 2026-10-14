// Ghalta, Primal Hunger
// This spell costs {X} less to cast, where X is the total power of creatures you control.
// Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)
import { defineCard, keyword } from '../../motor/api.ts';
import { forcaTotal } from '../dinossauros.ts';

export default defineCard({
  name: 'Ghalta, Primal Hunger',
  faces: [{
    // CR 601.2f: a redução entra no custo total, travado antes do pagamento; só tira mana genérica, então nunca fica
    // abaixo de {G}{G} (ruling 4). Força negativa subtrai; total 0 ou menos não reduz (ruling 3)
    selfCost: (c) => ({ reduce: Math.max(0, forcaTotal(c.g, c.you)) }),
    abilities: [keyword('trample')],
  }],
  rulings: {
    1: 'teste: com força total 6, custa {4}{G}{G}; o valor de mana continua 12',
    2: 'regra geral: CR 601.2f-h — o custo total é travado antes de ativar as habilidades de mana e pagar (motor/stack.ts totalSpellCost)',
    3: 'teste: força negativa subtrai da força total',
    4: 'teste: a redução não passa de {G}{G}',
  },
});
