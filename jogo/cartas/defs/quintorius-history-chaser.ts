// Quintorius, History Chaser — Legendary Planeswalker (comandante do Lorehold Spirit)
// Whenever one or more cards leave your graveyard, create a 3/2 red and white Spirit creature token.
// +1: You may discard a card. If you do, draw two cards, then mill a card.
// −4: Spirits you control gain double strike and vigilance until end of turn.
// Quintorius, History Chaser can be your commander. (CR 903.3a: regra de montagem de deck)
import { activated, addEffect, cost, createTokens, defineCard, discard, draw, is, mill, on, permanentsMatching, triggered, yesNo, and } from '../../motor/api.ts';

export default defineCard({
  name: 'Quintorius, History Chaser',
  faces: [{
    abilities: [
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you && !e.token)), function* (c) {
        yield* createTokens(c.g, c.you, 'Spirit 3/2', 1);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, crie uma ficha de criatura Espírito 3/2 vermelha e branca.' }),
      activated(cost('+1'), function* (c) {
        if (c.g.state.zones.hand[c.you].length === 0) return;
        if (!(yield* yesNo(c.g, c.you, 'Descartar uma carta para comprar duas e moer uma?'))) return;
        const d = yield* discard(c.g, c.you, 1);
        if (d.length === 0) return;
        yield* draw(c.g, c.you, 2);
        yield* mill(c.g, c.you, 1);
      }, { text: '+1: Você pode descartar uma carta. Se fizer isso, compre duas cartas e depois moa uma carta.' }),
      activated(cost('−4'), function* (c) {
        const spirits = permanentsMatching(c.g, (id) => and(is.creature, is.subtype('Spirit'), is.yours)({ g: c.g, you: c.you, source: c.source }, id));
        addEffect(c.g, {
          source: c.source, sourceDef: 'Quintorius, History Chaser', controller: c.you, duration: { kind: 'endOfTurn' },
          affected: spirits, mods: [{ k: 'addKeyword', kw: 'double strike' }, { k: 'addKeyword', kw: 'vigilance' }],
        });
      }, { text: '−4: Os Espíritos que você controla ganham golpe duplo e vigilância até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: "teste: cartas saindo do cemitério ao mesmo tempo disparam uma vez só",
  },
});
