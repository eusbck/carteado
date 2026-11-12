// The Meathook Massacre
// When The Meathook Massacre enters, each creature gets -X/-X until end of turn.
// Whenever a creature you control dies, each opponent loses 1 life.
// Whenever a creature an opponent controls dies, you gain 1 life.
import { allCreatures, defineCard, etb, gainLife, loseLife, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { xDaMagica } from '../sephiroth.ts';

export default defineCard({
  name: 'The Meathook Massacre',
  faces: [{
    abilities: [
      // ruling 1: sem ter sido conjurada (ou conjurada sem pagar o custo), X é 0
      etb(function* (c) {
        const x = xDaMagica(c.g, c.source);
        if (x > 0) untilEndOfTurn(c, allCreatures(c.g), [{ k: 'pt', p: -x, t: -x }]);
      }, { text: 'Quando The Meathook Massacre entra, cada criatura recebe -X/-X até o fim do turno.' }),
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida.' }),
      triggered(on.dies((c, lki) => c.g.isOpponent(c.you, lki.controller)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurada com X = 2, cada criatura recebe -2/-2 e as mortes drenam',
  },
});
