// Meathook Massacre II
// When Meathook Massacre II enters, each player sacrifices X creatures of their choice.
// Whenever a creature you control dies, you may pay 3 life. If you do, return that card under your control with a
// finality counter on it.
// Whenever a creature an opponent controls dies, they may pay 3 life. If they don't, return that card under your
// control with a finality counter on it.
import { defineCard, eachSacrifices, etb, isCreature, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { talvezPagueVida, xDaMagica } from '../sephiroth.ts';

/** devolve a carta que morreu, se ainda estiver no cemitério, sob o seu controle com um marcador de finalidade */
function* devolve(c: Ctx) {
  const carta = c.event.obj as ObjId;
  // rulings 1-2: a carta precisa continuar no cemitério; a ficha não volta
  if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
  yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, counters: { finality: 1 } }], 'effect');
}

export default defineCard({
  name: 'Meathook Massacre II',
  faces: [{
    abilities: [
      etb(function* (c) {
        const x = xDaMagica(c.g, c.source);
        if (x > 0) yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), x, `${x} criatura(s)`);
      }, { text: 'Quando Meathook Massacre II entra, cada jogador sacrifica X criaturas à escolha dele.' }),
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        if (yield* talvezPagueVida(c.g, c.you, 3, 'Meathook Massacre II: pagar 3 de vida para devolver a carta ao campo sob o seu controle com um marcador de finalidade?')) yield* devolve(c);
      }, { text: 'Sempre que uma criatura que você controla morre, você pode pagar 3 de vida. Se fizer isso, devolva essa carta sob o seu controle com um marcador de finalidade.' }),
      triggered(on.dies((c, lki) => c.g.isOpponent(c.you, lki.controller)), function* (c) {
        const dono = c.g.state.lki[c.event.old as ObjId]?.chars.controller as PlayerId;
        if (!(yield* talvezPagueVida(c.g, dono, 3, 'Meathook Massacre II: pagar 3 de vida para a carta não voltar ao campo sob o controle do oponente?'))) yield* devolve(c);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, ele pode pagar 3 de vida. Se não fizer isso, devolva essa carta sob o seu controle com um marcador de finalidade.' }),
    ],
  }],
  rulings: {
    1: 'teste: a carta que saiu do cemitério não volta, pagando ou não',
    2: 'teste: a ficha não volta',
    3: 'regra geral: CR 122.1h — com marcador de finalidade, iria para o cemitério e é exilada (motor/actions.ts)',
    4: 'regra geral: CR 122.1h — o marcador de finalidade só muda a ida para o cemitério (motor/actions.ts)',
    5: 'regra geral: CR 122.1h — o marcador de finalidade não é de palavra-chave (motor/actions.ts)',
    6: 'regra geral: CR 122.1h — vários marcadores de finalidade são redundantes (motor/actions.ts)',
  },
});
