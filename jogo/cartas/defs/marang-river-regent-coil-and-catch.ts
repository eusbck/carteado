// Marang River Regent // Coil and Catch
// Flying
// When this creature enters, return up to two other target nonland permanents to their owners' hands.
// Coil and Catch — {3}{U}, Instant — Omen
// Draw three cards, then discard a card. (Then shuffle this card into its owner's library.)
import { defineCard, etb, is, keyword, loot, returnToHand, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Marang River Regent // Coil and Catch',
  faces: [
    { abilities: [
      keyword('flying'),
      etb(function* (c) { yield* returnToHand(c.g, tgtsAll(c)); }, {
        targets: [upTo(2, t.nonlandPermanent(is.other, 'até duas outras permanentes alvo que não sejam terrenos'))],
        text: 'Quando esta criatura entra, devolva até duas outras permanentes alvo que não sejam terrenos para as mãos de seus donos.',
      }),
    ] },
    { spell: { *effect(c) { yield* loot(c, c.you, 3, 1); } } },
  ],
  rulings: {
    1: 'teste: a face de criatura tem voar, devolve até duas outras permanentes não terreno e fica no campo',
    2: 'teste: CR 720.4: fora da pilha, só é criatura com valor de mana 6',
    3: 'teste: presságio compra três, descarta uma e embaralha a própria carta no grimório do dono',
    4: 'teste: CR 720.3a: a permissão para criaturas do topo não permite conjurar o presságio',
    5: 'teste: presságio compra três, descarta uma e embaralha a própria carta no grimório do dono',
    6: 'regra geral: CR 608.2b — presságio sem alvos; presságios com todos os alvos ilegais não resolvem (motor/stack.ts)',
    7: 'teste: presságio anulado vai para o cemitério sem comprar, descartar ou embaralhar',
    8: 'teste: CR 720.3c-d: a cópia do presságio também embaralha o grimório do dono e deixa de existir',
    9: 'regra geral: CR 720.5 — o nome alternativo é um nome de carta (motor/oracle.ts)',
    10: 'teste: CR 720.3: conjurar o presságio sem pagar mana ainda compra e embaralha normalmente',
  },
});
