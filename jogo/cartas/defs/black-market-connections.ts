// Black Market Connections
// At the beginning of your first main phase, choose one or more —
// • Sell Contraband — Create a Treasure token. You lose 1 life.
// • Buy Information — Draw a card. You lose 2 life.
// • Hire a Mercenary — Create a 3/2 colorless Shapeshifter creature token with changeling. You lose 3 life. (It is every
// creature type.)
import { createTokens, defineCard, draw, loseLife, modal, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Black Market Connections',
  faces: [{
    abilities: [
      // "escolha um ou mais": os modos são escolhidos ao pôr o gatilho na pilha (CR 603.3c) e resolvem na ordem impressa
      triggered(on.firstMain(), function* () { /* os modos fazem tudo */ }, {
        modes: modal(1, 3, [
          { text: 'Vender Contrabando — Crie uma ficha de Treasure. Você perde 1 de vida', *effect(c) { yield* createTokens(c.g, c.you, 'Treasure', 1); loseLife(c.g, c.you, 1, c.source); } },
          { text: 'Comprar Informação — Compre uma carta. Você perde 2 de vida', *effect(c) { yield* draw(c.g, c.you, 1); loseLife(c.g, c.you, 2, c.source); } },
          { text: 'Contratar um Mercenário — Crie uma ficha de criatura Shapeshifter 3/2 incolor com polimorfo. Você perde 3 de vida', *effect(c) { yield* createTokens(c.g, c.you, 'Shapeshifter 3/2', 1); loseLife(c.g, c.you, 3, c.source); } },
        ]),
        text: 'No início da sua primeira fase principal, escolha um ou mais — Vender Contrabando; Comprar Informação; Contratar um Mercenário.',
      }),
    ],
  }],
  rulings: {},
});
