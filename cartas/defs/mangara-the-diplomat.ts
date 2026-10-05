// Mangara, the Diplomat
// Lifelink
// Whenever an opponent attacks with creatures, if two or more of those creatures are attacking you and/or planeswalkers
// you control, draw a card.
// Whenever an opponent casts their second spell each turn, draw a card.
import { controllerOf, defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId, TargetRef } from '../../motor/types.ts';

const contraMim = (g: G, eu: PlayerId, t: TargetRef): boolean => (t.kind === 'player' ? t.id === eu : controllerOf(g, t.id) === eu);

export default defineCard({
  name: 'Mangara, the Diplomat',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || !c.g.isOpponent(c.you, e.player)) return false;
        const criaturas = e.attackers.filter((a) => contraMim(c.g, c.you, a.target)).map((a) => a.obj);
        return criaturas.length >= 2 ? { criaturas } : false;
      }), function* (c) { yield* draw(c.g, c.you, 1); }, {
        // ruling 5: quem saiu do campo conta pela última informação; quem saiu do combate, pela atual
        condition: (c) => {
          const s = c.g.state;
          const ids = (c.event.criaturas ?? []) as ObjId[];
          return ids.filter((id) => {
            if (s.objects[id]?.zone !== 'battlefield') return true;
            const a = s.combat?.attackers.find((x) => x.id === id && !x.removed);
            return !!a && contraMim(c.g, c.you, a.target);
          }).length >= 2;
        },
        text: 'Sempre que um oponente ataca com criaturas, se duas ou mais delas estiverem atacando você e/ou planeswalkers que você controla, compre uma carta.',
      }),
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player].spellsCast === 2), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente conjura a segunda mágica dele num turno, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    2: 'regra geral: CR 117.3c — jogadores recebem prioridade entre o gatilho e a mágica',
    3: 'teste: compra uma só, com três atacando',
    4: 'regra geral: o texto conta você e seus planeswalkers juntos',
    5: 'teste: atacante removido do combate deixa de contar',
  },
});
