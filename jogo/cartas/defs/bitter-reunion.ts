// Bitter Reunion
// When this enchantment enters, you may discard a card. If you do, draw two cards.
// {1}, Sacrifice this enchantment: Creatures you control gain haste until end of turn.
import { activated, creaturesOf, defineCard, discard, draw, etb, untilEndOfTurn, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Bitter Reunion',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!c.g.state.zones.hand[c.you].length) return;
        if (!(yield* yesNo(c.g, c.you, 'Bitter Reunion: descartar uma carta para comprar duas?'))) return;
        // "se fizer isso": só compra se uma carta foi mesmo descartada
        const descartadas = yield* discard(c.g, c.you, 1);
        if (descartadas.length) yield* draw(c.g, c.you, 2);
      }, { text: 'Quando este encantamento entra, você pode descartar uma carta. Se fizer isso, compre duas cartas.' }),
      activated('{1}, Sacrifice this enchantment', function* (c) {
        // CR 611.2c: vale para as criaturas que você controla na resolução
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'haste' }]);
      }, { text: '{1}, Sacrifique este encantamento: As criaturas que você controla ganham ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
