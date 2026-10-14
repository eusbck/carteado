// Cache Grab
// Mill four cards. You may put a permanent card from among the cards milled this way into your hand. If you control a
// Squirrel or returned a Squirrel card to your hand this way, create a Food token. (To mill four cards, put the top four
// cards of your library into your graveyard. A Food token is an artifact with "{2}, {T}, Sacrifice this token: You gain
// 3 life.")
import { chars, chooseItems, controlledBy, createTokens, defineCard, isPermanentCard, mill, moveObjects, nameOf, objItem } from '../../motor/api.ts';
import { COMIDA, ehEsquilo } from '../esquilos.ts';

export default defineCard({
  name: 'Cache Grab',
  faces: [{
    spell: {
      *effect(c) {
        const moidas = (yield* mill(c.g, c.you, 4)).filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && isPermanentCard(c.g, id));
        let esquiloDevolvido = false;
        if (moidas.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Cache Grab: pôr uma carta de permanente moída na mão?',
            [{ id: 'nao', label: 'Nenhuma' }, ...moidas.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
          if (esc !== 'nao') {
            esquiloDevolvido = chars(c.g, Number(esc)).subtypes.includes('Squirrel');
            yield* moveObjects(c.g, [{ id: Number(esc), to: 'hand' }], 'effect');
          }
        }
        if (esquiloDevolvido || controlledBy(c.g, c.you, (id) => ehEsquilo(c.g, id)).length > 0) yield* createTokens(c.g, c.you, 'Food', 1);
      },
    },
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.umCusto,
    3: COMIDA.piada,
  },
});
