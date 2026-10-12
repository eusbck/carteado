// Triarch Praetorian
// Flying
// Dynastic Codes — When this creature enters from a graveyard, you draw two cards and you lose 2 life.
// Unearth {4}{B} ({4}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the
// beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { defineCard, draw, keyword, loseLife, on, triggered, unearth } from '../../motor/api.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Triarch Praetorian',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.from === 'graveyard' && e.obj === c.source), function* (c) {
        yield* draw(c.g, c.you, 2);
        loseLife(c.g, c.you, 2, c.source);
      }, { text: 'Dynastic Codes — Quando esta criatura entra vinda de um cemitério, você compra duas cartas e perde 2 pontos de vida.' }),
      unearth('{4}{B}'),
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