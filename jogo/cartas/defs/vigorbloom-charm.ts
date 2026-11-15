// Vigorbloom Charm
// Choose one —
// • Target permanent you control gains hexproof and indestructible until end of turn.
// • You draw a card and gain 3 life.
// • Put a +1/+1 counter on target creature you control. Then it fights target creature an opponent controls.
// (Each deals damage equal to its power to the other.)
import { addCounters, defineCard, draw, gainLife, is, modal, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { luta } from '../wakanda.ts';

export default defineCard({
  name: 'Vigorbloom Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'A permanente alvo que você controla ganha resistência a magia e indestrutível até o fim do turno',
          targets: [t.permanent(is.yours, 'permanente alvo que você controla')],
          *effect(c) {
            const id = tgt(c);
            if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
          },
        },
        {
          text: 'Você compra uma carta e ganha 3 pontos de vida',
          *effect(c) {
            yield* draw(c.g, c.you, 1);
            gainLife(c.g, c.you, 3, c.source);
          },
        },
        {
          text: 'Coloque um marcador +1/+1 na sua criatura alvo e ela luta com a criatura alvo de um oponente',
          targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(is.opponents, 'criatura alvo que um oponente controla')],
          *effect(c) {
            const minha = tgt(c);
            const oponente = tgt(c, 1);
            if (minha !== null) addCounters(c.g, { kind: 'obj', id: minha }, '+1/+1', 1, c.you);
            // CR 701.14b: se um dos alvos for ilegal, não há luta; o marcador ainda pode ser colocado.
            if (minha !== null && oponente !== null) luta(c.g, minha, oponente);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
