// Bloodtracker
// Flying
// {B}, Pay 2 life: Put a +1/+1 counter on this creature.
// When this creature leaves the battlefield, draw a card for each +1/+1 counter on it.
import { activated, addCounters, defineCard, draw, keyword, lkiObj, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodtracker',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{B}, Pay 2 life', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: '{B}, Pague 2 de vida: Coloque um marcador +1/+1 nesta criatura.' }),
      // olha para trás (CR 603.10a): os marcadores que ela tinha ao sair do campo
      triggered(on.selfLeaves(), function* (c) {
        const n = lkiObj(c.g, c.source)?.counters['+1/+1'] ?? 0;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando esta criatura sai do campo de batalha, compre uma carta para cada marcador +1/+1 nela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a — conta os marcadores +1/+1 que ela tinha ao sair, mesmo que marcadores -1/-1 a tenham matado (os dois tipos só se anulam nas ações de estado)',
  },
});
