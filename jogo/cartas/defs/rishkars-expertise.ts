// Rishkar's Expertise
// Draw cards equal to the greatest power among creatures you control.
// You may cast a spell with mana value 5 or less from your hand without paying its mana cost.
import { chooseItems, defineCard, draw, isLand, manaValue, mayCastFree, nameOf, objItem } from '../../motor/api.ts';
import { maiorForca } from '../dinossauros.ts';

export default defineCard({
  name: "Rishkar's Expertise",
  faces: [{
    spell: {
      *effect(c) {
        // ruling 6: a maior força é vista na resolução; sem criatura com força maior que 0, não compra (ruling 2)
        const n = maiorForca(c.g, c.you);
        if (n > 0) yield* draw(c.g, c.you, n);
        // ruling 3: pode ser uma das compradas; ruling 10: terreno não se conjura; ruling 4: valor de mana impresso
        const cartas = c.g.state.zones.hand[c.you].filter((id) => !isLand(c.g, id) && manaValue(c.g, id) <= 5);
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, "Rishkar's Expertise: você pode conjurar uma mágica com valor de mana 5 ou menos da mão sem pagar o custo de mana", cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 709.4 — a carta dividida na mão tem o valor de mana das duas metades (motor/chars.ts); conjurada, escolhe a metade (motor/stack.ts)',
    2: 'teste: sem criaturas, não compra, mas ainda pode conjurar uma mágica de graça',
    3: 'teste: compra cartas iguais à maior força e conjura de graça uma das compradas',
    4: 'regra geral: CR 202.3 — o valor de mana vem do custo impresso (motor/chars.ts)',
    5: 'regra geral: CR 107.3b — conjurada sem pagar o custo de mana, X é 0 (motor/stack.ts)',
    6: 'teste: compra cartas iguais à maior força e conjura de graça uma das compradas',
    7: 'regra geral: CR 118.9 — sem pagar o custo de mana não se usa custo alternativo; os adicionais obrigatórios são pagos (motor/stack.ts)',
    8: 'regra geral: CR 608.2g — a mágica conjurada vai para a pilha acima da Expertise, que só vai para o cemitério ao terminar (motor/stack.ts)',
    9: 'regra geral: CR 603.3 — os gatilhos da resolução esperam a mágica terminar para ir à pilha (motor/triggers.ts)',
    10: 'teste: terreno não é oferecido',
  },
});
