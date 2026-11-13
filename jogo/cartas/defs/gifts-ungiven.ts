// Gifts Ungiven
// Search your library for up to four cards with different names and reveal them. Target opponent chooses two of those
// cards. Put the chosen cards into your graveyard and the rest into your hand. Then shuffle.
import { chooseItems, defineCard, moveObjects, nameOf, objItem, searchLibrary, shuffleLibrary, t, tgtPlayer } from '../../motor/api.ts';
import type { ObjId, ZoneName } from '../../motor/types.ts';

export default defineCard({
  name: 'Gifts Ungiven',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const op = tgtPlayer(c);
        // até quatro cartas com nomes diferentes: uma de cada vez, sem repetir nome (CR 701.23d)
        const achadas: ObjId[] = [];
        for (let i = 0; i < 4; i++) {
          const nomes = new Set(achadas.map((id) => nameOf(c.g, id)));
          const prox = yield* searchLibrary(c.g, c.you, c.you, {
            max: 1, filter: (id) => !achadas.includes(id) && !nomes.has(nameOf(c.g, id)),
            prompt: `Gifts Ungiven: procure a ${i + 1}ª carta com nome diferente (ou nenhuma para parar)`,
          });
          if (!prox.length) break;
          achadas.push(prox[0]);
        }
        if (achadas.length) {
          c.g.log(`${c.g.state.players[c.you].name} revela ${achadas.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
          // ruling 1: com duas ou menos, todas vão para o cemitério
          let cemiterio = achadas;
          if (achadas.length > 2 && op !== null) {
            const r = yield* chooseItems(c.g, op, `Gifts Ungiven: escolha duas cartas que vão para o cemitério de ${c.g.state.players[c.you].name} (as outras vão para a mão)`, achadas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 2, 2);
            cemiterio = r.map(Number);
          }
          yield* moveObjects(c.g, achadas.map((id) => ({ id, to: (cemiterio.includes(id) ? 'graveyard' : 'hand') as ZoneName })), 'search');
        }
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: { 1: 'teste: com duas cartas ou menos, as duas vão para o cemitério' },
});
