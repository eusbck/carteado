// Reya Dawnbringer
// Flying
// At the beginning of your upkeep, you may return target creature card from your graveyard to the battlefield.
import { defineCard, is, keyword, nameOf, on, putOntoBattlefield, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Reya Dawnbringer',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.upkeep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Reya Dawnbringer: devolver ${nameOf(c.g, id)} ao campo?`)) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério')],
        text: 'No início da sua manutenção, você pode devolver a carta de criatura alvo do seu cemitério ao campo.',
      }),
    ],
  }],
  rulings: {},
});
