// God-Eternal Bontu
// Menace
// When God-Eternal Bontu enters, sacrifice any number of other permanents, then draw that many cards.
// When God-Eternal Bontu dies or is put into exile from the battlefield, you may put her into her owner's library
// third from the top.
import { chooseItems, controlledBy, defineCard, draw, etb, keywords, moveObject, nameOf, objItem, sacrifice, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'God-Eternal Bontu',
  faces: [{
    abilities: [
      ...keywords('menace'),
      // rulings 1-2: pode escolher zero; os gatilhos dos sacrifícios só vão para a pilha depois de comprar
      etb(function* (c) {
        const outros = controlledBy(c.g, c.you, (id) => id !== c.source);
        if (!outros.length) return;
        const ids = yield* chooseItems(c.g, c.you, 'God-Eternal Bontu: sacrifique quantas outras permanentes quiser (compra o mesmo tanto)', outros.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, outros.length);
        if (!ids.length) return;
        const feitos = (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length;
        if (feitos) yield* draw(c.g, c.you, feitos);
      }, { text: 'Quando God-Eternal Bontu entra, sacrifique qualquer número de outras permanentes e depois compre esse mesmo número de cartas.' }),
      // olha para trás (CR 603.10a): morrer ou ir do campo para o exílio
      triggered({ kind: 'event', match: (e, c) => e.type === 'zone' && e.from === 'battlefield' && (e.to === 'graveyard' || e.to === 'exile') && e.old === c.source ? { carta: e.obj } : false }, function* (c) {
        const carta = c.event.carta as ObjId;
        const o = c.g.state.objects[carta];
        // só a carta que acabou de chegar ao cemitério ou ao exílio (CR 400.7)
        if (!o || (o.zone !== 'graveyard' && o.zone !== 'exile')) return;
        if (!(yield* yesNo(c.g, c.you, 'God-Eternal Bontu: colocá-la no grimório do dono, em terceiro a partir do topo?'))) return;
        yield* moveObject(c.g, carta, 'library', 'effect', { position: 2 });
      }, { text: 'Quando God-Eternal Bontu morre ou é exilada do campo, você pode colocá-la no grimório do dono, em terceiro a partir do topo.' }),
    ],
  }],
  rulings: {
    1: 'teste: os gatilhos dos sacrifícios vão para a pilha depois de comprar',
    2: 'teste: pode sacrificar zero permanentes',
    3: 'regra geral: CR 704.5j (regra das lendárias) acontece antes de o gatilho da segunda Bontu ir para a pilha (motor/sba.ts)',
  },
});
