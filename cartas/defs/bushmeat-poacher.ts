// Bushmeat Poacher
// {1}, {T}, Sacrifice another creature: You gain life equal to the sacrificed creature's toughness. Draw a card.
import { activated, defineCard, draw, gainLife, lkiChars } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Bushmeat Poacher',
  faces: [{
    abilities: [activated('{1}, {T}, Sacrifice another creature', function* (c) {
      const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
      // ruling 2: resistência como a criatura existiu por último no campo
      const r = sac !== undefined ? Math.max(0, lkiChars(c.g, sac)?.toughness ?? 0) : 0;
      gainLife(c.g, c.you, r, c.source);
      yield* draw(c.g, c.you, 1); // ruling 1: uma carta só
    }, { text: '{1}, {T}, Sacrifique outra criatura: Você ganha vida igual à resistência da criatura sacrificada. Compre uma carta.' })],
  }],
  rulings: {
    1: 'teste: ganha vida igual à resistência e compra uma carta só',
    2: 'teste: usa a resistência da criatura no campo (com modificadores)',
  },
});
