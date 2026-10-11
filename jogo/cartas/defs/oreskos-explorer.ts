// Oreskos Explorer
// When this creature enters, search your library for up to X Plains cards, where X is the number of players who control
// more lands than you. Reveal those cards, put them into your hand, then shuffle.
import { controlledBy, defineCard, etb, isLand, isSubtype, searchTo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

const terrenos = (g: G, p: PlayerId): number => controlledBy(g, p, (id) => isLand(g, id)).length;

export default defineCard({
  name: 'Oreskos Explorer',
  faces: [{
    abilities: [
      etb(function* (c) {
        // ruling 1: X é contado na resolução; ruling 2: com X igual a 0 você ainda procura e embaralha
        const meus = terrenos(c.g, c.you);
        const x = c.g.playersInGame().filter((p) => p !== c.you && terrenos(c.g, p) > meus).length;
        yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Plains'), x, 'hand', { reveal: true, prompt: `Oreskos Explorer: escolha até ${x} carta${x === 1 ? '' : 's'} de Plains` });
      }, { text: 'Quando esta criatura entra, procure no seu grimório até X cartas de Plains, onde X é o número de jogadores que controlam mais terrenos que você. Revele essas cartas, coloque-as na sua mão e depois embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: X é o número de jogadores com mais terrenos que você, contado na resolução',
    2: 'regra geral: CR 701.23 — com X igual a 0 ainda procura e embaralha, sem achar nada (motor/efeitos.ts searchTo)',
  },
});
