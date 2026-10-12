// Captain America, Living Legend
// Vigilance
// Whenever a creature you control becomes tapped during your turn, if it's the first time that creature has become
// tapped this turn, untap it.
import { controllerOf, defineCard, isCreature, keyword, on, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Captain America, Living Legend',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // a contagem de viradas do turno é do motor (state.tappedThisTurn), para valer mesmo antes de ele chegar
      triggered(on.custom((e, c) => (e.type === 'tap' && c.g.state.turn.active === c.you && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you
        && c.g.state.tappedThisTurn?.turn === c.g.state.turn.number && c.g.state.tappedThisTurn.times[String(e.obj)] === 1 ? { criatura: e.obj } : false)), function* (c) {
        const id = c.event.criatura as number;
        if (c.g.state.objects[id]?.zone === 'battlefield') untap(c.g, id);
      }, { text: 'Sempre que uma criatura que você controla é virada durante o seu turno, se for a primeira vez que essa criatura foi virada neste turno, desvire-a.' }),
    ],
  }],
  rulings: {},
});