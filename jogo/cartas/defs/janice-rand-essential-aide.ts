// Janice Rand, Essential Aide
// Whenever a commander you control enters or attacks, put a +1/+1 counter on it, then reveal cards from the top of
// your library until you reveal a land card. Put that card onto the battlefield tapped and the rest on the bottom of
// your library in a random order.
import { addCounters, controllerOf, defineCard, isLand, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';
import { ehComandante } from '../vingadores.ts';
import { paraOFundoAleatorio, revelaAte } from '../startrek.ts';

const TEXTO = 'Sempre que um comandante que você controla entra ou ataca, coloque um marcador +1/+1 nele; depois revele cartas do topo do seu grimório até revelar uma carta de terreno. Coloque essa carta no campo virada e o resto no fundo do seu grimório em ordem aleatória.';

function* efeito(c: Ctx): Gen<void> {
  const cmd = c.event.comandante as ObjId;
  if (c.g.state.objects[cmd]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: cmd }, '+1/+1', 1, c.you);
  const { achada, outras } = revelaAte(c.g, c.you, (id) => isLand(c.g, id));
  if (achada !== null) yield* putOntoBattlefield(c.g, [{ id: achada, controller: c.you, tapped: true }], 'effect');
  paraOFundoAleatorio(c.g, c.you, outras);
}

export default defineCard({
  name: 'Janice Rand, Essential Aide',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && controllerOf(c.g, e.obj) === c.you && ehComandante(c.g, e.obj) ? { comandante: e.obj } : false)), efeito, { text: TEXTO }),
      triggered(on.custom((e, c) => (e.type === 'attackers' ? e.attackers.filter((a) => controllerOf(c.g, a.obj) === c.you && ehComandante(c.g, a.obj)).map((a) => ({ comandante: a.obj })) : false)), efeito, { text: TEXTO }),
    ],
  }],
  rulings: {},
});
