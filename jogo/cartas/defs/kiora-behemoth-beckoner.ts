// Kiora, Behemoth Beckoner
// Whenever a creature you control with power 4 or greater enters, draw a card.
// −1: Untap target permanent.
import { activated, defineCard, draw, t, tgt, triggered, untap } from '../../motor/api.ts';
import { entraCriaturaForte } from '../dragoes.ts';

export default defineCard({
  name: 'Kiora, Behemoth Beckoner',
  faces: [{
    abilities: [
      // rulings 1-2: a força ao entrar; se ela cair depois, compra mesmo assim
      triggered(entraCriaturaForte(), function* (c) { yield* draw(c.g, c.you, 1); },
        { text: 'Sempre que uma criatura com força 4 ou mais que você controla entra, compre uma carta.' }),
      activated('−1', function* (c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
      }, { targets: [t.permanent()], text: '−1: Desvire o permanente alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra quando entra uma criatura sua com força 4 ou mais, não com força menor',
    2: 'regra geral: CR 603.4 — sem cláusula "se", o gatilho não confere a força de novo na resolução',
  },
});
