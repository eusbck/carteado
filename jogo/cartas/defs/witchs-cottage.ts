// Witch's Cottage — Land — Swamp
// ({T}: Add {B}.)
// This land enters tapped unless you control three or more other Swamps.
// When this land enters untapped, you may put target creature card from your graveyard on top of your library.
import { defineCard, is, land, moveObjects, nameOf, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Witch's Cottage",
  faces: [{
    abilities: [
      land.tappedUnlessOtherOfType('Swamp', 3),
      // "quando entra desvirado": olha o estado em que entrou
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source && !c.g.state.objects[c.source]?.tapped), function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, `Pôr ${nameOf(c.g, id)} no topo do grimório?`))) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'top');
      }, { targets: [t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério')], text: 'Quando este terreno entra desvirado, você pode pôr a carta de criatura alvo do seu cemitério no topo do seu grimório.' }),
    ],
  }],
  rulings: {
    1: 'teste: entra virado com só dois outros Swamps (CR 614.12: só vê os que já estão no campo)',
    2: 'regra geral: a substituição só vira o terreno, nunca o desvira (entersTapped)',
  },
});
