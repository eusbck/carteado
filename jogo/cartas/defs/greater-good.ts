// Greater Good
// Sacrifice a creature: Draw cards equal to the sacrificed creature's power, then discard three cards.
import { activated, defineCard, discard, draw, lkiChars } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Greater Good',
  faces: [{
    abilities: [
      activated('Sacrifice a creature', function* (c) {
        // ruling 1: a força que a criatura tinha quando estava no campo pela última vez
        const [sacrificada] = (c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [];
        const x = sacrificada === undefined ? 0 : Math.max(0, lkiChars(c.g, sacrificada)?.power ?? 0);
        if (x > 0) yield* draw(c.g, c.you, x);
        // rulings 2-3: descarta três (ou a mão inteira), sem nada no meio
        yield* discard(c.g, c.you, Math.min(3, c.g.state.zones.hand[c.you].length));
      }, { text: 'Sacrifique uma criatura: Compre cartas iguais à força da criatura sacrificada, depois descarte três cartas.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra cartas iguais à força da criatura sacrificada e depois descarta três',
    2: 'teste: com menos de três cartas na mão, descarta a mão inteira',
    3: 'regra geral: CR 608.2 — comprar e descartar acontecem na mesma resolução (motor/stack.ts resolveTop)',
  },
});