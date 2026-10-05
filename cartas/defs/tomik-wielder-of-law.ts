// Tomik, Wielder of Law
// Affinity for planeswalkers (This spell costs {1} less to cast for each planeswalker you control.)
// Flying, vigilance
// Whenever an opponent attacks with creatures, if two or more of those creatures are attacking you and/or planeswalkers
// you control, that opponent loses 3 life and you draw a card.
import { controlledBy, controllerOf, defineCard, draw, isType, keywords, loseLife, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId, TargetRef } from '../../motor/types.ts';

const contraMim = (g: G, eu: PlayerId, t: TargetRef): boolean => (t.kind === 'player' ? t.id === eu : controllerOf(g, t.id) === eu);

export default defineCard({
  name: 'Tomik, Wielder of Law',
  faces: [{
    // CR 702.41: afinidade por planeswalkers
    selfCost: (c) => ({ reduce: controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Planeswalker')).length }),
    abilities: [
      ...keywords('flying', 'vigilance'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || !c.g.isOpponent(c.you, e.player)) return false;
        const criaturas = e.attackers.filter((a) => contraMim(c.g, c.you, a.target)).map((a) => a.obj);
        return criaturas.length >= 2 ? { criaturas, oponente: e.player } : false;
      }), function* (c) {
        loseLife(c.g, c.event.oponente as PlayerId, 3, c.source);
        yield* draw(c.g, c.you, 1);
      }, {
        // condição repetida na resolução (CR 603.4): quem saiu do combate deixa de contar
        condition: (c) => {
          const s = c.g.state;
          return ((c.event.criaturas ?? []) as ObjId[]).filter((id) => {
            if (s.objects[id]?.zone !== 'battlefield') return true;
            const a = s.combat?.attackers.find((x) => x.id === id && !x.removed);
            return !!a && contraMim(c.g, c.you, a.target);
          }).length >= 2;
        },
        text: 'Sempre que um oponente ataca com criaturas, se duas ou mais delas estiverem atacando você e/ou planeswalkers que você controla, esse oponente perde 3 de vida e você compra uma carta.',
      }),
    ],
  }],
});
