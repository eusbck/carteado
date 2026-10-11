// Doctor Doom, King of Latveria
// Whenever you discard one or more land cards, each opponent loses 2 life.
// At the beginning of combat on your turn, target Villain you control gains menace until end of turn. It connives. (Draw
// a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)
import { and, connive, defineCard, is, isLand, loseLife, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Doctor Doom, King of Latveria',
  faces: [{
    abilities: [
      // "uma ou mais": um gatilho por lote de descartes
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'discard' && e.player === c.you && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj))), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 2, c.source);
      }, { text: 'Sempre que você descarta uma ou mais cartas de terreno, cada oponente perde 2 de vida.' }),
      triggered(on.beginCombat('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'menace' }]);
        yield* connive(c.g, id);
      }, { targets: [t.permanent(and(is.yours, is.subtype('Villain')), 'Villain alvo que você controla')], text: 'No início do combate no seu turno, o Villain alvo que você controla ganha ameaçar até o fim do turno. Ele trama.' }),
    ],
  }],
  rulings: {},
});
