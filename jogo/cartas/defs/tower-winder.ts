// Tower Winder
// Reach, deathtouch
// When this creature enters, search your library and/or graveyard for a card named Command Tower, reveal it, and put it
// into your hand. If you search your library this way, shuffle.
import { chooseItems, chooseOne, defineCard, etb, keywords, moveObjects, nameOf, objItem, searchLibrary, shuffleLibrary } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const TORRE = 'Command Tower';

export default defineCard({
  name: 'Tower Winder',
  faces: [{
    abilities: [
      ...keywords('reach', 'deathtouch'),
      etb(function* (c) {
        const s = c.g.state;
        const onde = yield* chooseOne(c.g, c.you, 'Tower Winder: onde procurar uma carta chamada Command Tower?', [
          { id: 'cemiterio', label: 'No cemitério' },
          { id: 'grimorio', label: 'No grimório' },
          { id: 'ambos', label: 'No grimório e no cemitério' },
        ]);
        const noCemiterio = onde !== 'grimorio' ? s.zones.graveyard[c.you].filter((id) => nameOf(c.g, id) === TORRE) : [];
        let achada: ObjId | null = null;
        if (onde !== 'cemiterio') {
          // a busca no grimório pede um nome, então pode não achar (CR 701.23b); com o cemitério junto, a escolha é uma só
          if (noCemiterio.length) {
            const [r] = yield* chooseItems(c.g, c.you, 'Tower Winder: pegar a Command Tower do cemitério ou procurar no grimório?', [
              ...noCemiterio.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (cemitério)`)),
              { id: 'grimorio', label: 'Procurar no grimório' },
            ], 1, 1);
            if (r !== 'grimorio') achada = Number(r);
          }
          if (achada === null) {
            const [l] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => nameOf(c.g, id) === TORRE, prompt: 'Procure uma carta chamada Command Tower' });
            if (l !== undefined) achada = l;
          }
        } else if (noCemiterio.length) achada = noCemiterio[0];
        if (achada !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, achada)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: achada, to: 'hand' }], 'search');
        }
        if (onde !== 'cemiterio') shuffleLibrary(c.g, c.you);
      }, { text: 'Quando esta criatura entra, procure no seu grimório e/ou no seu cemitério uma carta chamada Command Tower, revele-a e coloque-a na sua mão. Se procurar no grimório assim, embaralhe.' }),
    ],
  }],
  rulings: {},
});
