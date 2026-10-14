// Baral's Expertise
// Return up to three target artifacts and/or creatures to their owners' hands.
// You may cast a spell with mana value 4 or less from your hand without paying its mana cost.
import { chooseItems, defineCard, is, isLand, manaValue, mayCastFree, nameOf, objItem, or, returnToHand, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: "Baral's Expertise",
  faces: [{
    spell: {
      targets: [upTo(3, t.permanent(or(is.artifact, is.creature), 'artefato e/ou criatura alvo'))],
      *effect(c) {
        const alvos = tgtsAll(c, 0);
        if (alvos.length) yield* returnToHand(c.g, alvos);
        // ruling 3: pode ser uma das devolvidas; ruling 5: terreno não se conjura; ruling 9: valor de mana impresso
        const cartas = c.g.state.zones.hand[c.you].filter((id) => !isLand(c.g, id) && manaValue(c.g, id) <= 4);
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, "Baral's Expertise: você pode conjurar uma mágica com valor de mana 4 ou menos da mão sem pagar o custo de mana", cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 709.4 — a carta dividida na mão tem o valor de mana das duas metades (motor/chars.ts); conjurada, escolhe a metade (motor/stack.ts)',
    2: 'regra geral: CR 107.3b — conjurada sem pagar o custo de mana, X é 0 (motor/stack.ts)',
    3: 'teste: devolve até três artefatos e criaturas e conjura de graça uma das devolvidas',
    4: 'regra geral: CR 608.2b — com todos os alvos ilegais a mágica não resolve e não há mágica de graça (motor/stack.ts resolveTop)',
    5: 'teste: terreno não é oferecido',
    6: 'regra geral: CR 118.9 — sem pagar o custo de mana não se usa custo alternativo; os adicionais obrigatórios são pagos (motor/stack.ts)',
    7: 'regra geral: CR 608.2g — a mágica conjurada vai para a pilha acima da Expertise, que só vai para o cemitério ao terminar (motor/stack.ts)',
    8: 'regra geral: CR 603.3 — os gatilhos da resolução esperam a mágica terminar para ir à pilha (motor/triggers.ts)',
    9: 'regra geral: CR 202.3 — o valor de mana vem do custo impresso (motor/chars.ts)',
  },
});
