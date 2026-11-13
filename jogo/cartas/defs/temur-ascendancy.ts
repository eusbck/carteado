// Temur Ascendancy
// Creatures you control have haste.
// Whenever a creature you control with power 4 or greater enters, you may draw a card.
import { anthem, controllerOf, defineCard, draw, isCreature, triggered, yesNo } from '../../motor/api.ts';
import { entraCriaturaForte } from '../dragoes.ts';

export default defineCard({
  name: 'Temur Ascendancy',
  faces: [{
    abilities: [
      // ruling 3: saindo do campo, as criaturas perdem o ímpeto
      anthem((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you, () => [{ k: 'addKeyword', kw: 'haste' }], 'As criaturas que você controla têm ímpeto.'),
      // rulings 1-2: a força ao entrar; se cair depois, ainda compra
      triggered(entraCriaturaForte(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Temur Ascendancy: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura com força 4 ou mais que você controla entra, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra (se quiser) quando entra uma criatura sua com força 4 ou mais',
    2: 'regra geral: CR 603.4 — sem cláusula "se", o gatilho não confere a força de novo na resolução',
    3: 'teste: as suas criaturas têm ímpeto enquanto ela estiver no campo',
  },
});
