// Hullbreaker Horror
// Flash
// This spell can't be countered.
// Whenever you cast a spell, choose up to one —
// • Return target spell you don't control to its owner's hand.
// • Return target nonland permanent to its owner's hand.
import { controllerOf, defineCard, keyword, modal, on, returnToHand, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Hullbreaker Horror',
  faces: [{
    cantBeCountered: true,
    abilities: [
      keyword('flash'),
      // CR 700.2b, 603.3c: os modos são escolhidos ao pôr o gatilho na pilha; sem modo, ele sai da pilha
      triggered(on.youCast(), function* () { /* efeito nos modos */ }, {
        modes: modal(0, 1, [
          {
            text: 'Devolva a mágica alvo que você não controla para a mão do dono',
            targets: [t.spell((c, id) => controllerOf(c.g, id) !== c.you, 'mágica alvo que você não controla')],
            *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
          },
          {
            text: 'Devolva o permanente não terreno alvo para a mão do dono',
            targets: [t.nonlandPermanent()],
            *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
          },
        ]),
        text: 'Sempre que você conjura uma mágica, escolha até um — • Devolva a mágica alvo que você não controla para a mão do dono. • Devolva o permanente não terreno alvo para a mão do dono.',
      }),
    ],
  }],
  rulings: {},
});
