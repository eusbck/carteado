// M'Baku, Jabari Chieftain
// At the beginning of your end step, if there is no monarch, target opponent becomes the monarch.
// Whenever a creature attacks one of your opponents, if that player is the monarch, that creature gets +1/+1 and gains
// trample until end of turn.
import { becomeMonarch, defineCard, on, t, tgtPlayer, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: "M'Baku, Jabari Chieftain",
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) becomeMonarch(c.g, p);
      }, {
        // CR 603.4: cláusula "se" interveniente
        condition: (c) => c.g.state.monarch === null,
        targets: [t.opponent()],
        text: 'No início da sua etapa final, se não houver monarca, o oponente alvo se torna o monarca.',
      }),
      // um gatilho por criatura que ataca um oponente seu que é o monarca, de quem for a criatura
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => a.target.kind === 'player' && a.target.id === c.g.state.monarch && c.g.isOpponent(c.you, a.target.id)).map((a) => ({ criatura: a.obj, jogador: a.target.id }))
        : false)), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }]);
      }, {
        condition: (c) => c.g.state.monarch !== null && c.g.state.monarch === (c.event.jogador as number | undefined),
        text: 'Sempre que uma criatura ataca um dos seus oponentes, se esse jogador for o monarca, essa criatura recebe +1/+1 e ganha atropelar até o fim do turno.',
      }),
    ],
  }],
  rulings: {},
});