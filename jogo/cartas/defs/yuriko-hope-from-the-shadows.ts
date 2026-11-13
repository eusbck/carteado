// Yuriko, Hope from the Shadows
// Flash
// When Yuriko enters, choose one —
// • Target creature gets -X/-0 until end of turn, where X is the number of cards in your graveyard.
// • Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest
// on top of your library in any order.)
import { defineCard, keyword, lookAndArrange, modal, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Yuriko, Hope from the Shadows',
  faces: [{
    abilities: [
      keyword('flash'),
      triggered(on.selfEnters(), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          {
            text: 'A criatura alvo recebe -X/-0 até o fim do turno, onde X é o número de cartas no seu cemitério',
            targets: [t.creature()],
            *effect(c) {
              const id = tgt(c);
              // CR 608.2h: X é fixado na resolução
              const x = c.g.state.zones.graveyard[c.you].length;
              if (id !== null && x > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: -x, t: 0 }]);
            },
          },
          { text: 'Vigiar 2', *effect(c) { yield* lookAndArrange(c.g, c.you, 2, 'surveil'); } },
        ]),
        text: 'Quando Yuriko entra, escolha um — a criatura alvo recebe -X/-0 até o fim do turno, onde X é o número de cartas no seu cemitério; ou vigiar 2.',
      }),
    ],
  }],
  rulings: {},
});
