// Tiamat
// Flying
// When Tiamat enters, if you cast it, search your library for up to five Dragon cards not named Tiamat that each have
// different names, reveal them, put them into your hand, then shuffle.
import { defineCard, etb, keyword, moveObjects, nameOf, searchLibrary, shuffleLibrary } from '../../motor/api.ts';
import { ehDragao } from '../dragoes.ts';
import { jog, objs, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Tiamat',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const g = c.g;
        // ruling 2: Dragon é o tipo de criatura, não o nome
        const achados = yield* searchLibrary(g, c.you, c.you, {
          max: 5, filter: (id) => ehDragao(g, id) && nameOf(g, id) !== 'Tiamat',
          prompt: 'Tiamat: procure até cinco cartas de Dragon com nomes diferentes (sem Tiamat)',
        });
        // nomes diferentes: de cada nome, fica a primeira escolhida
        const nomes = new Set<string>();
        const ficam = achados.filter((id) => { const n = nameOf(g, id); if (nomes.has(n)) return false; nomes.add(n); return true; });
        if (ficam.length) {
          reg(g, 'revela')`${jog(c.you)} revela ${objs(ficam)} (Tiamat).`;
          yield* moveObjects(g, ficam.map((id) => ({ id, to: 'hand' as const })), 'search');
        }
        shuffleLibrary(g, c.you);
      }, {
        // CR 603.4: "se você a conjurou" (de qualquer zona, ruling 1): o permanente veio de uma mágica
        condition: (c) => !!c.g.state.objects[c.source]?.data.spell,
        text: 'Quando Tiamat entra, se você a conjurou, procure no seu grimório até cinco cartas de Dragon com nomes diferentes e que não se chamem Tiamat, revele-as, coloque-as na sua mão e embaralhe.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conjurada da zona de comando também procura; posta no campo sem conjurar, não',
    2: 'teste: só cartas com o tipo Dragon, com nomes diferentes e sem Tiamat',
  },
});
