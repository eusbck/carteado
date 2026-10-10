// Mazemind Tome
// {T}, Put a page counter on this artifact: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)
// {2}, {T}, Put a page counter on this artifact: Draw a card.
// When there are four or more page counters on this artifact, exile it. If you do, you gain 4 life.
import { activated, defineCard, draw, exile, gainLife, lookAndArrange, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Mazemind Tome",
  faces: [{
    abilities: [
      activated('{T}, Put a page counter on this artifact', function*(c) { yield* lookAndArrange(c.g, c.you, 1, 'scry'); }, { text: '{T}, Coloque um marcador de página: vidência 1.' }),
      activated('{2}, {T}, Put a page counter on this artifact', function*(c) { yield* draw(c.g, c.you, 1); }, { text: '{2}, {T}, Coloque um marcador de página: compre uma carta.' }),
      triggered({ kind: 'state', check: (c) => (c.obj.counters.page ?? 0) >= 4 }, function*(c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const out = yield* exile(c.g, [c.source]);
        if (out.some((id) => id !== null)) gainLife(c.g, c.you, 4, c.source);
      }, { text: 'Quando tiver quatro ou mais marcadores de página, exile este artefato. Se fizer isso, ganhe 4 de vida.' }),
    ]
  }],
  rulings: {
    "1": "CR 400.7, 603.8: teste: sair do campo antes da resolução impede exilar o novo objeto e ganhar vida."
  },
});
