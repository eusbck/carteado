// Return of the Wildspeaker
// Choose one —
// • Draw cards equal to the greatest power among non-Human creatures you control.
// • Non-Human creatures you control get +3/+3 until end of turn.
import { creaturesOf, defineCard, draw, isSubtype, modal, power, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const naoHumanas = (g: G, p: PlayerId): ObjId[] => creaturesOf(g, p).filter((id) => !isSubtype(g, id, 'Human'));

export default defineCard({
  name: 'Return of the Wildspeaker',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Compre cartas iguais à maior força entre as criaturas não Humanas que você controla',
          *effect(c) {
            // a maior força é lida na resolução
            const n = naoHumanas(c.g, c.you).reduce((m, id) => Math.max(m, power(c.g, id)), 0);
            if (n > 0) yield* draw(c.g, c.you, n);
          },
        },
        {
          text: 'As criaturas não Humanas que você controla recebem +3/+3 até o fim do turno',
          *effect(c) {
            // só as que você controla na resolução (CR 611.2c)
            const ids = naoHumanas(c.g, c.you);
            if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 3, t: 3 }]);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
