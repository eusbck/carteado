// Mystic Confluence
// Choose three. You may choose the same mode more than once.
// • Counter target spell unless its controller pays {3}.
// • Return target creature to its owner's hand.
// • Draw a card.
import { counter, defineCard, draw, mayPay, modal, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mystic Confluence',
  faces: [{
    spell: {
      // CR 700.2d: três modos, podendo repetir; ruling 1: resolvem na ordem em que estão escritos
      modes: modal(3, 3, [
        {
          text: 'Anule a mágica alvo, a menos que quem a controla pague {3}',
          targets: [t.spell()],
          *effect(c) {
            const id = tgt(c);
            if (id === null) return;
            const quem = c.g.state.objects[id]?.stack?.controller;
            // CR 118.12a: "a menos que pague" = o jogador pode pagar; se não pagar, a mágica é anulada
            if (quem !== undefined && !c.g.state.players[quem].left && (yield* mayPay(c, quem, '{3}', 'a mágica não ser anulada (Mystic Confluence)'))) return;
            yield* counter(c.g, id);
          },
        },
        {
          text: 'Devolva a criatura alvo para a mão do dono',
          targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
        },
        { text: 'Compre uma carta', *effect(c) { yield* draw(c.g, c.you, 1); } },
      ], { repeat: true }),
    },
  }],
  rulings: {
    1: 'teste: os três modos podem ser diferentes ou repetidos, e resolvem na ordem escrita',
    2: 'regra geral: CR 608.2c — com o modo do meio repetido, as criaturas voltam uma depois da outra, na ordem dos alvos (motor/stack.ts)',
    3: 'regra geral: CR 608.2 — ninguém age entre os modos de uma mágica resolvendo (motor/stack.ts)',
    4: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    5: 'teste: com todos os alvos ilegais, a mágica não resolve e você não compra',
  },
});
