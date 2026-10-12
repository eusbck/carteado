// Chronomancer
// Flying
// Atomic Transmutation — {1}, {T}, Sacrifice another artifact: Draw a card.
// Unearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the
// beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { activated, defineCard, draw, keyword, unearth } from '../../motor/api.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Chronomancer',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{1}, {T}, Sacrifice another artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Atomic Transmutation — {1}, {T}, Sacrifique outro artefato: Compre uma carta.' }),
      unearth('{2}{B}'),
    ],
  }],
  rulings: {
    1: DESENTERRAR.sumiu,
    2: DESENTERRAR.naoMagica,
    3: DESENTERRAR.sairia,
    4: DESENTERRAR.etapaFinal,
    5: DESENTERRAR.impeto,
  },
});