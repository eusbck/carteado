// The Mending of Dominaria
// I, II — Mill two cards, then you may return a creature card from your graveyard to your hand.
// III — Return all land cards from your graveyard to the battlefield, then shuffle your graveyard into your library.
import { chapter, chooseItems, defineCard, isCreature, mill, moveObjects, nameOf, objItem, sagaEnters, shuffleLibrary } from '../../motor/api.ts';
import { terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'The Mending of Dominaria',
  faces: [{
    abilities: [
      sagaEnters(),
      chapter([1, 2], function* (c) {
        yield* mill(c.g, c.you, 2);
        const cands = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (!cands.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'The Mending of Dominaria: devolva até uma carta de criatura do cemitério para a mão', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, 1);
        if (esc.length) yield* moveObjects(c.g, [{ id: Number(esc[0]), to: 'hand' }], 'effect');
      }, { text: 'I, II — Moa duas cartas e depois você pode devolver uma carta de criatura do seu cemitério para a sua mão.' }),
      chapter([3], function* (c) {
        yield* terrenosDoCemiterio(c, false);
        const resto = [...c.g.state.zones.graveyard[c.you]];
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'library' as const })), 'effect');
        shuffleLibrary(c.g, c.you);
      }, { text: 'III — Devolva todas as cartas de terreno do seu cemitério ao campo de batalha e depois embaralhe o seu cemitério no seu grimório.' }),
    ],
  }],
  rulings: {},
});
