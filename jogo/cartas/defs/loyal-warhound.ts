// Loyal Warhound
// Vigilance
// When this creature enters, if an opponent controls more lands than you, search your library for a basic Plains card,
// put it onto the battlefield tapped, then shuffle.
import { and, controlledBy, defineCard, etb, is, isLand, keyword, searchTo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const oponenteComMaisTerrenos = (c: SCtx): boolean => {
  const conta = (p: number) => controlledBy(c.g, p, (id) => isLand(c.g, id)).length;
  const meus = conta(c.you);
  return c.g.opponents(c.you).some((p) => conta(p) > meus);
};

export default defineCard({
  name: 'Loyal Warhound',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // cláusula "se" interveniente (CR 603.4): conferida ao disparar e ao resolver
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => and(is.basic, is.subtype('Plains'))(c, id), 1, 'battlefield', { tapped: true, prompt: 'Loyal Warhound: escolha uma carta de Plains básica' });
      }, { condition: oponenteComMaisTerrenos, text: 'Quando esta criatura entra, se um oponente controla mais terrenos que você, procure no seu grimório uma carta de Plains básica, coloque-a no campo de batalha virada e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});
