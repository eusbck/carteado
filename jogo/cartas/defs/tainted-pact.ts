// Tainted Pact
// Exile the top card of your library. You may put that card into your hand unless it has the same name as another card
// exiled this way. Repeat this process until you put a card into your hand or you exile two cards with the same name,
// whichever comes first.
import { defineCard, moveObjects, nameOf, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Tainted Pact',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const nomes = new Set<string>();
        for (let guarda = 0; guarda < 500; guarda++) {
          const topo = g.state.zones.library[c.you][0];
          if (topo === undefined) break;
          const nome = nameOf(g, topo);
          const [ex] = yield* moveObjects(g, [{ id: topo, to: 'exile' }], 'exile');
          // duas cartas com o mesmo nome: o processo para
          if (nomes.has(nome)) break;
          nomes.add(nome);
          if (ex === null || ex === undefined || g.state.objects[ex]?.zone !== 'exile') continue;
          if (yield* yesNo(g, c.you, `Tainted Pact: colocar ${nome} na sua mão? (senão, exila a próxima)`, 'Pôr na mão', 'Exilar a próxima')) {
            yield* moveObjects(g, [{ id: ex, to: 'hand' }], 'effect');
            break;
          }
        }
      },
    },
  }],
  rulings: {},
});
