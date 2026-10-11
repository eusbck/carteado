// Loran of the Third Path
// Vigilance
// When Loran enters, destroy up to one target artifact or enchantment.
// {T}: You and target opponent each draw a card.
import { activated, defineCard, destroy, draw, etb, is, keyword, or, t, tgt, tgtPlayer, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Loran of the Third Path',
  faces: [{
    abilities: [
      keyword('vigilance'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [upTo(1, t.permanent(or(is.artifact, is.enchantment), 'até um artefato ou encantamento alvo'))], text: 'Quando Loran entra, destrua até um artefato ou encantamento alvo.' }),
      activated('{T}', function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        yield* draw(c.g, c.you, 1);
        yield* draw(c.g, p, 1);
      }, { targets: [t.opponent()], text: '{T}: Você e o oponente alvo compram uma carta cada.' }),
    ],
  }],
  rulings: {},
});
