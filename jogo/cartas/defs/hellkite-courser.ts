// Hellkite Courser
// Flying
// When this creature enters, you may put a commander you own from the command zone onto the battlefield. It gains
// haste. Return it to the command zone at the beginning of the next end step.
import {
  chooseItems, defineAbility, defineCard, delayed, etb, keyword, moveObjects, nameOf, nextEndStepTrigger, objItem, putOntoBattlefield, untilEndOfTurn,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// ruling 2: só volta se ainda estiver no campo (o mesmo objeto)
const DEVOLVE = 'Hellkite Courser:devolve';
defineAbility(DEVOLVE, nextEndStepTrigger(function* (c) {
  const id = c.data.comandante as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* moveObjects(c.g, [{ id, to: 'command' }], 'effect');
}, 'No início da próxima etapa final, devolva o comandante à zona de comando.'));

export default defineCard({
  name: 'Hellkite Courser',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const g = c.g;
        const s = g.state;
        const cands = s.zones.command.filter((id) => {
          const o = s.objects[id];
          return !!o && o.owner === c.you && o.card !== null && s.cards[o.card]?.isCommander;
        });
        if (!cands.length) return;
        const esc = yield* chooseItems(g, c.you, 'Hellkite Courser: você pode colocar no campo um comandante seu da zona de comando', cands.map((id) => objItem(g, id, nameOf(g, id))), 0, 1);
        if (!esc.length) return;
        // ruling 1: não é conjurar; o imposto de comandante não aumenta
        const [novo] = yield* putOntoBattlefield(g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
        if (novo === undefined || g.state.objects[novo]?.zone !== 'battlefield') return;
        untilEndOfTurn(c, [novo], [{ k: 'addKeyword', kw: 'haste' }]);
        // "ganha ímpeto" sem duração: até o fim do turno basta, porque ele volta à zona de comando na etapa final
        delayed(c, DEVOLVE, { data: { comandante: novo } });
      }, { text: 'Quando esta criatura entra, você pode colocar no campo um comandante de que você é dono que esteja na zona de comando. Ele ganha ímpeto. Devolva-o à zona de comando no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: põe o comandante no campo com ímpeto sem aumentar o imposto, e ele volta na etapa final',
    2: 'teste: se o comandante já saiu do campo, não volta à zona de comando',
  },
});
