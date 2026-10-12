// Vision, Synthezoid Avenger
// Flying
// Whenever a player casts a spell, if it isn't that player's turn, choose one —
// • Put a +1/+1 counter on Vision.
// • Vision phases out. (Treat him and anything attached to him as though they don't exist until your next turn.)
import { addCounters, defineCard, keyword, modal, on, phaseOut, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vision, Synthezoid Avenger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy ? { conjurador: e.player } : false)), function* () { /* modos */ }, {
        // CR 603.4: "se não for o turno desse jogador", conferido ao disparar e ao resolver
        condition: (c) => c.g.state.turn.active !== (c.event.conjurador as number),
        modes: modal(1, 1, [
          { text: 'Coloque um marcador +1/+1 em Vision', *effect(c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you); } },
          { text: 'Vision sai de fase', *effect(c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') phaseOut(c.g, [c.source]); } },
        ]),
        text: 'Sempre que um jogador conjura uma mágica, se não for o turno desse jogador, escolha um — coloque um marcador +1/+1 em Vision; ou Vision sai de fase.',
      }),
    ],
  }],
  rulings: {},
});