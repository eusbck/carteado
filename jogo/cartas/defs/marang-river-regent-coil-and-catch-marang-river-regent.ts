// Marang River Regent // Coil and Catch (carta de presságio, CR 720; no Moxfield vem a impressão reversível)
// Marang River Regent {4}{U}{U} — Creature — Dragon 6/7
// Flying
// When this creature enters, return up to two other target nonland permanents to their owners' hands.
// Coil and Catch {3}{U} — Instant — Omen
// Draw three cards, then discard a card. (Then shuffle this card into its owner's library.)
import { defineCard, discard, draw, etb, is, keyword, returnToHand, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Marang River Regent // Coil and Catch // Marang River Regent',
  faces: [
    {
      abilities: [
        keyword('flying'),
        etb(function* (c) {
          const ids = tgtsAll(c).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
          if (ids.length) yield* returnToHand(c.g, ids);
        }, {
          targets: [upTo(2, t.nonlandPermanent(is.other, 'outro permanente não terreno alvo'))],
          text: 'Quando esta criatura entra, devolva até dois outros permanentes não terreno alvo para as mãos dos donos.',
        }),
      ],
    },
    {
      // presságio (CR 720.3d): ao resolver, é embaralhada no grimório do dono (motor/stack.ts)
      spell: {
        *effect(c) {
          yield* draw(c.g, c.you, 3);
          yield* discard(c.g, c.you, 1);
        },
      },
    },
  ],
  rulings: {
    1: 'teste: ao conjurar, escolhe a criatura ou o presságio',
    2: 'teste: fora da pilha é uma carta de criatura Dragon azul de valor 6',
    3: 'teste: na pilha como presságio, só as características de Coil and Catch',
    4: 'regra geral: CR 720.3a — conjurando o presságio, só as características dele contam para poder conjurar (motor/priority.ts castChars)',
    5: 'teste: o presságio resolvido é embaralhado no grimório do dono',
    6: 'não se aplica: Coil and Catch não tem alvos',
    7: 'teste: anulado, o presságio vai para o cemitério',
    8: 'regra geral: CR 707.10, 720.3c — a cópia de uma mágica deixa de existir ao resolver (motor/stack.ts)',
    9: 'não se aplica: nenhuma carta dos decks manda escolher um nome de carta',
    10: 'regra geral: CR 720.3 — conjurar como presságio não é custo alternativo; "sem pagar o custo de mana" vale para o presságio (motor/stack.ts totalSpellCost)',
  },
});
