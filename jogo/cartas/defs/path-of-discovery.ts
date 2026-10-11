// Path of Discovery
// Whenever a creature you control enters, it explores. (Reveal the top card of your library. Put that card into your
// hand if it's a land. Otherwise, put a +1/+1 counter on the creature, then put the card back or put it into your
// graveyard.)
import { and, defineCard, explore, is, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Path of Discovery',
  faces: [{
    abilities: [
      // ruling 3: a criatura explora mesmo que já tenha saído do campo (CR 701.44c), sem receber marcador
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.creature, is.yours)(c, e.obj) ? { criatura: e.obj } : false)), function* (c) {
        yield* explore(c.g, c.event.criatura as ObjId);
      }, { text: 'Sempre que uma criatura que você controla entra, ela explora.' }),
    ],
  }],
  rulings: {
    1: 'teste: terreno no topo vai para a mão; carta que não é terreno dá um marcador +1/+1 e pode ir para o cemitério',
    2: 'regra geral: CR 701.44a — quem explora é a permanente, criatura ou não (motor/mecanicas.ts explore)',
    3: 'regra geral: CR 701.44c — a criatura que saiu do campo explora mesmo assim, sem marcador (motor/mecanicas.ts explore)',
    4: 'regra geral: CR 701.44a — a carta deixada no topo é revelada de novo na próxima exploração',
    5: 'regra geral: CR 701.44c — a criatura que saiu do campo explora mesmo assim, sem marcador (motor/mecanicas.ts explore)',
    6: 'teste: sem carta no grimório, a criatura recebe o marcador',
    7: 'regra geral: CR 603.3b — cada gatilho de explorar resolve em separado, com prioridade entre eles',
    8: 'regra geral: CR 608.2 — ninguém age durante a resolução, entre revelar a carta e colocar o marcador (motor/mecanicas.ts explore)',
  },
});
