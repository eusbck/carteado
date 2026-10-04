// Archaeomancer's Map
// When this artifact enters, search your library for up to two basic Plains cards, reveal them, put them into your
// hand, then shuffle.
// Whenever a land an opponent controls enters, if that player controls more lands than you, you may put a land card
// from your hand onto the battlefield.
import {
  chooseItems, controlledBy, controllerOf, defineCard, etb, isBasicLand, isLand, isSubtype, nameOf, objItem, on,
  putOntoBattlefield, searchTo, triggered, type G,
} from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const terrenos = (g: G, p: PlayerId) => controlledBy(g, p, (id) => isLand(g, id)).length;

export default defineCard({
  name: "Archaeomancer's Map",
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id) && isSubtype(c.g, id, 'Plains'), 2, 'hand', { reveal: true, prompt: 'Procure até duas cartas de Plains básica' });
      }, { text: 'Quando este artefato entra, procure até duas cartas de Plains básica, revele-as e coloque-as na sua mão.' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.to !== 'battlefield' || !c.g.state.objects[e.obj] || !isLand(c.g, e.obj)) return false;
        const p = controllerOf(c.g, e.obj);
        return c.g.isOpponent(c.you, p) ? { player: p } : false;
      }), function* (c) {
        const mao = c.g.state.zones.hand[c.you].filter((id) => isLand(c.g, id));
        if (mao.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, "Archaeomancer's Map: você pode colocar uma carta de terreno da sua mão no campo", mao.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (pick.length) yield* putOntoBattlefield(c.g, [{ id: Number(pick[0]), controller: c.you }], 'effect');
      }, {
        // ruling 1: "se" interveniente, conferido de novo ao resolver (CR 603.4)
        condition: (c) => terrenos(c.g, c.event!.player as PlayerId) > terrenos(c.g, c.you),
        text: 'Sempre que um terreno de um oponente entra, se esse jogador controla mais terrenos que você, você pode colocar uma carta de terreno da sua mão no campo.',
      }),
    ],
  }],
  rulings: { 1: 'teste: CR 603.4: só dispara se o oponente fica com mais terrenos que você' },
});
