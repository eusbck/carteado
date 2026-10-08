// Mystic Sanctuary — Land — Island
// ({T}: Add {U}.)
// This land enters tapped unless you control three or more other Islands.
// When this land enters untapped, you may put target instant or sorcery card from your graveyard on top of your library.
import { defineCard, is, land, moveObjects, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mystic Sanctuary',
  faces: [{
    abilities: [
      land.tappedUnlessOtherOfType('Island', 3),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source && !c.g.state.objects[c.source]?.tapped), function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, 'Pôr a mágica no topo do grimório?'))) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'top');
      }, { targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo do seu cemitério')], text: 'Quando entra desvirado, você pode pôr a carta de instantânea ou feitiço alvo do seu cemitério no topo do grimório.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: a substituição só vira o terreno, nunca o desvira (entersTapped)',
    2: 'regra geral: CR 614.12 — só vê terrenos que já estão no campo',
  },
});
