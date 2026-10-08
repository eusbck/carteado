// Ghoulcaller Gisa
// {B}, {T}, Sacrifice another creature: Create X 2/2 black Zombie creature tokens, where X is the sacrificed creature's
// power.
import { activated, createTokens, defineCard, lkiChars } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Ghoulcaller Gisa',
  faces: [{
    abilities: [activated('{B}, {T}, Sacrifice another creature', function* (c) {
      const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
      // força como a criatura existiu por último no campo (CR 608.2h); força negativa não cria fichas (CR 107.1b)
      const x = sac !== undefined ? Math.max(0, lkiChars(c.g, sac)?.power ?? 0) : 0;
      yield* createTokens(c.g, c.you, 'Zombie 2/2', x);
    }, { text: '{B}, {T}, Sacrifique outra criatura: Crie X fichas de criatura Zombie pretas 2/2, onde X é a força da criatura sacrificada.' })],
  }],
  rulings: {},
});
