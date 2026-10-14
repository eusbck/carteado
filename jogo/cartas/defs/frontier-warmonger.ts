// Frontier Warmonger
// Whenever one or more creatures attack one of your opponents or a planeswalker they control, those creatures gain
// menace until end of turn.
import { controllerOf, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Frontier Warmonger',
  faces: [{
    abilities: [
      // um disparo por oponente atacado (ele ou um planeswalker dele); ruling 1: vale também para ataques entre oponentes
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const porOponente = new Map<PlayerId, ObjId[]>();
        for (const a of e.attackers) {
          const def = a.target.kind === 'player' ? a.target.id : c.g.state.objects[a.target.id] ? controllerOf(c.g, a.target.id) : null;
          if (def === null || !c.g.isOpponent(c.you, def)) continue;
          if (a.target.kind === 'obj' && !c.g.state.objects[a.target.id]) continue;
          porOponente.set(def, [...(porOponente.get(def) ?? []), a.obj]);
        }
        return [...porOponente.values()].map((criaturas) => ({ criaturas }));
      }), function* (c) {
        const ids = (c.event.criaturas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'menace' }]);
      }, { text: 'Sempre que uma ou mais criaturas atacam um dos seus oponentes ou um planeswalker que ele controla, essas criaturas ganham ameaçar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: criaturas de um oponente atacando outro oponente também ganham ameaçar',
  },
});
