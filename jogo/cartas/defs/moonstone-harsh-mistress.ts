// Moonstone, Harsh Mistress
// Flying
// Whenever you discard a card, you may exile that card from your graveyard. If you do, until the end of your next turn,
// you may play that card.
import { allowPlay, defineCard, exile, keyword, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Moonstone, Harsh Mistress',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'discard' && e.player === c.you ? { carta: e.obj } : false)), function* (c) {
        const carta = c.event.carta as ObjId;
        // a carta tem de continuar no seu cemitério (descartada para o exílio ou já removida: nada acontece)
        if (c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, `Moonstone: exilar ${nameOf(c.g, carta)} do seu cemitério? (você poderá jogá-la até o fim do seu próximo turno)`))) return;
        const [ex] = yield* exile(c.g, [carta]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number });
      }, { text: 'Sempre que você descarta uma carta, você pode exilar essa carta do seu cemitério. Se fizer isso, até o fim do seu próximo turno, você pode jogar essa carta.' }),
    ],
  }],
  rulings: {},
});
