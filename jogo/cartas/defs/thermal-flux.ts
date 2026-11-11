// Thermal Flux
// Choose one —
// • Target nonsnow permanent becomes snow until end of turn.
// • Target snow permanent isn't snow until end of turn.
// Draw a card at the beginning of the next turn's upkeep.
import { chars, defineCard, delayed, modal, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { Pred } from '../../motor/dsl.ts';
import { compraNaProximaManutencao } from '../twitch.ts';

const COMPRA = compraNaProximaManutencao('Thermal Flux');
const neve: Pred = (c, id) => chars(c.g, id).supertypes.includes('Snow');

export default defineCard({
  name: 'Thermal Flux',
  faces: [{
    spell: {
      // ruling 1: só o supertipo snow muda; os outros tipos ficam (CR 205.4b)
      modes: modal(1, 1, [
        {
          text: 'O permanente alvo que não é snow vira snow até o fim do turno',
          targets: [t.permanent((c, id) => !neve(c, id), 'permanente alvo que não é snow')],
          *effect(c) {
            const id = tgt(c);
            if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addTypes', supertypes: ['Snow'] }]);
            delayed(c, COMPRA.id!);
          },
        },
        {
          text: 'O permanente alvo snow deixa de ser snow até o fim do turno',
          targets: [t.permanent(neve, 'permanente alvo snow')],
          *effect(c) {
            const id = tgt(c);
            if (id !== null) untilEndOfTurn(c, [id], [{ k: 'removeTypes', types: [], supertypes: ['Snow'] }]);
            delayed(c, COMPRA.id!);
          },
        },
      ]),
    },
  }],
  rulings: { 1: 'teste: o permanente vira snow e continua com os outros tipos; no fim do turno, volta' },
});
