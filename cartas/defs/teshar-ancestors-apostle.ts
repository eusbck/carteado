// Teshar, Ancestor's Apostle
// Flying
// Whenever you cast a historic spell, return target creature card with mana value 3 or less from your graveyard to the
// battlefield. (Artifacts, legendaries, and Sagas are historic.)
import { and, defineCard, is, keyword, on, or, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Teshar, Ancestor's Apostle",
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 2-5: só ao conjurar; histórica = lendária, artefato ou Saga; resolve antes da mágica
      triggered(on.youCast(or(is.legendary, is.artifact, is.subtype('Saga'))), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', and(is.creature, is.mvAtMost(3)), 'carta de criatura alvo com valor de mana 3 ou menos no seu cemitério')],
        text: 'Sempre que você conjura uma mágica histórica, devolva a carta de criatura alvo com valor de mana 3 ou menos do seu cemitério ao campo.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — X vale 0 no cemitério',
    2: 'regra geral: CR 601.2 — pôr no campo sem conjurar não dispara',
    3: 'teste: artefato e lendária disparam',
    4: 'regra geral: CR 603.3 — resolve antes da mágica',
    5: 'regra geral: CR 305.1 — terrenos não são conjurados',
  },
});
