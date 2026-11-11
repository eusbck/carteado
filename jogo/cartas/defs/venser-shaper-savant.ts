// Venser, Shaper Savant
// Flash (You may cast this spell any time you could cast an instant.)
// When Venser enters, return target spell or permanent to its owner's hand.
import { defineCard, etb, keyword, returnToHand, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Venser, Shaper Savant',
  faces: [{
    abilities: [
      keyword('flash'),
      // rulings 2 e 5: devolver a mágica não é anular; vale contra a que não pode ser anulada. Rulings 1 e 4: a conjurada
      // com retrospectiva vai para o exílio (CR 702.34a); rulings 3 e 6: a cópia deixa de existir (CR 704.5d)
      etb(function* (c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); }, {
        targets: [{ what: 'spellOrPermanent', label: 'mágica ou permanente alvo' }],
        text: 'Quando Venser entra, devolva a mágica ou o permanente alvo para a mão do dono.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a mágica conjurada com retrospectiva vai para o exílio em vez da mão',
    2: 'teste: devolve para a mão a mágica que não pode ser anulada',
    3: 'teste: a cópia de uma mágica devolvida deixa de existir',
    4: 'teste: a mágica conjurada com retrospectiva vai para o exílio em vez da mão',
    5: 'teste: devolve para a mão a mágica que não pode ser anulada',
    6: 'teste: a cópia de uma mágica devolvida deixa de existir',
  },
});
