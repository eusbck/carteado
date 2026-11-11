// Meathook Massacre II
// When Meathook Massacre II enters, each player sacrifices X creatures of their choice.
// Whenever a creature you control dies, you may pay 3 life. If you do, return that card under your control with a
// finality counter on it.
// Whenever a creature an opponent controls dies, they may pay 3 life. If they don't, return that card under your control
// with a finality counter on it.
import { defineCard, eachSacrifices, etb, isCreature, loseLife, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** CR 119.4: só paga vida quem tem vida suficiente */
function* pagaTres(c: Ctx, p: PlayerId, pergunta: string): Gen<boolean> {
  if (c.g.state.players[p].life < 3) return false;
  if (!(yield* yesNo(c.g, p, pergunta, 'Pagar 3 de vida', 'Não pagar'))) return false;
  loseLife(c.g, p, 3, c.source);
  return true;
}

function* devolve(c: Ctx): Gen<void> {
  const carta = c.event.obj as ObjId;
  if (c.g.state.objects[carta]?.zone !== 'graveyard') return; // fichas não voltam
  yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you, counters: { finality: 1 } }], 'effect');
}

export default defineCard({
  name: 'Meathook Massacre II',
  faces: [{
    abilities: [
      etb(function* (c) {
        const x = (c.g.state.objects[c.source]?.data.spell as { x?: number } | undefined)?.x ?? 0;
        if (x > 0) yield* eachSacrifices(c, c.g.playersInGame(), (id) => isCreature(c.g, id), x, `${x} criatura(s)`);
      }, { text: 'Quando Meathook Massacre II entra, cada jogador sacrifica X criaturas à escolha dele.' }),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        if (c.g.state.objects[c.event.obj as ObjId]?.zone !== 'graveyard') return;
        if (yield* pagaTres(c, c.you, 'Meathook Massacre II: pagar 3 de vida para devolver a criatura com um marcador de finalidade?')) yield* devolve(c);
      }, { text: 'Sempre que uma criatura que você controla morre, você pode pagar 3 de vida. Se fizer isso, devolva essa carta sob o seu controle com um marcador de finalidade.' }),
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
        if (c.g.state.objects[c.event.obj as ObjId]?.zone !== 'graveyard') return;
        const dono = c.g.state.lki[c.event.old as ObjId]?.chars.controller;
        if (dono === undefined) return;
        if (!(yield* pagaTres(c, dono, 'Meathook Massacre II: pagar 3 de vida para a sua criatura não voltar para o oponente?'))) yield* devolve(c);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, ele pode pagar 3 de vida. Se não fizer isso, devolva essa carta sob o seu controle com um marcador de finalidade.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3m — X é o valor pago ao conjurar; se entrar de outro jeito, X é 0',
    2: 'regra geral: CR 122.1h — com marcador de finalidade, se fosse para o cemitério vai para o exílio (motor/actions.ts)',
    3: 'regra geral: CR 119.4 — só paga 3 de vida quem tem 3 ou mais',
    4: 'regra geral: CR 111.7 — fichas não voltam',
    5: 'regra geral: CR 603.10a — dispara pelas criaturas sacrificadas pela própria habilidade de entrada',
    6: 'regra geral: CR 400.7 — volta como objeto novo',
  },
});
