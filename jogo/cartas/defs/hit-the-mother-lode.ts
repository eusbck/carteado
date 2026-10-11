// Hit the Mother Lode
// Discover 10. If the discovered card's mana value is less than 10, create a number of tapped Treasure tokens equal to
// the difference. (To discover 10, exile cards from the top of your library until you exile a nonland card with mana
// value 10 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a
// random order.)
import { createTokens, defineCard, discover } from '../../motor/api.ts';

export default defineCard({
  name: 'Hit the Mother Lode',
  faces: [{
    spell: {
      *effect(c) {
        // CR 701.57a; ruling 2: vale o valor de mana da carta (X conta 0), não o que foi pago
        const valor = yield* discover(c.g, c.you, 10);
        // ruling 1: as fichas só são criadas depois de terminar de descobrir
        if (valor !== null && valor < 10) yield* createTokens(c.g, c.you, 'Treasure', 10 - valor, { tapped: true });
      },
    },
  }],
  rulings: {
    1: 'teste: descobre 10, conjura a carta de graça e depois cria os Treasures virados pela diferença',
    2: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/mecanicas.ts discover)',
    3: 'regra geral: CR 701.57a — exilar é obrigatório; só conjurar é opcional (motor/mecanicas.ts discover)',
    4: 'regra geral: CR 701.57a — as cartas são exiladas com a face para cima (motor/mecanicas.ts discover)',
    5: 'regra geral: CR 118.9 — sem pagar o custo de mana não dá para usar outro custo alternativo (motor/mecanicas.ts mayCastFree)',
    6: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    7: 'teste: sem conjurar, a carta descoberta vai para a mão e os Treasures são criados do mesmo jeito',
    8: 'não se aplica: Hit the Mother Lode não tem alvos',
    9: 'não se aplica: nenhuma carta split dos decks pode ser descoberta por esta carta ainda (formato pendente no motor)',
    10: 'não se aplica: cartas de aventura, split e modais de duas faces ainda não são conjuráveis pelo descobrir (formato pendente no motor)',
  },
});
