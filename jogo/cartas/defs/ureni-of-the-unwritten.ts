// Ureni of the Unwritten
// Flying, trample
// Whenever Ureni enters or attacks, look at the top eight cards of your library. You may put a Dragon creature card
// from among them onto the battlefield. Put the rest on the bottom of your library in a random order.
import { chooseItems, defineCard, isCreature, keywords, moveObjects, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { Ctx } from '../../motor/defs.ts';
import { ehDragao } from '../dragoes.ts';

function* olhaOito(c: Ctx) {
  const g = c.g;
  const topo = g.state.zones.library[c.you].slice(0, 8);
  if (!topo.length) return;
  const cands = topo.filter((id) => isCreature(g, id) && ehDragao(g, id));
  let posta: number | null = null;
  if (cands.length) {
    const esc = yield* chooseItems(g, c.you, 'Ureni of the Unwritten: você pode colocar no campo uma carta de criatura Dragon', cands.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
    if (esc.length) posta = Number(esc[0]);
  }
  if (posta !== null) yield* putOntoBattlefield(g, [{ id: posta, controller: c.you }], 'effect');
  const resto = shuffle(g.state.rng, topo.filter((id) => id !== posta && g.state.objects[id]?.zone === 'library'));
  if (resto.length) yield* moveObjects(g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
}

const TEXTO = 'Sempre que Ureni entra ou ataca, olhe as oito cartas do topo do seu grimório. Você pode colocar no campo uma carta de criatura Dragon dentre elas. Coloque o resto no fundo do seu grimório em ordem aleatória.';

export default defineCard({
  name: 'Ureni of the Unwritten',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      triggered(on.selfEnters(), olhaOito, { text: TEXTO }),
      triggered(on.selfAttacks(), olhaOito, { text: TEXTO }),
    ],
  }],
  rulings: {},
});
