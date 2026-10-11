// Baron Strucker, HYDRA Overlord
// Villain spells you cast cost {1} less to cast.
// Whenever another Villain you control enters, you may have it connive. Do this only once each turn. (Draw a card, then
// discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)
import { and, connive, defineCard, is, nameOf, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Baron Strucker, HYDRA Overlord',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Villain') ? { reduce: 1 } : null) },
        text: 'As mágicas de Villain que você conjura custam {1} a menos.',
      }),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.yours, is.other, is.subtype('Villain'))(c, e.obj) ? { villain: e.obj } : false)), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // "faça isso só uma vez por turno": conta quando você de fato faz o Villain tramar
        if (!eu || eu.data.struckerTurno === s.turn.number) return;
        const v = c.event.villain as ObjId;
        if (!(yield* yesNo(c.g, c.you, `Baron Strucker: fazer ${s.objects[v] ? nameOf(c.g, v) : 'o Villain'} tramar? (só uma vez por turno)`))) return;
        eu.data.struckerTurno = s.turn.number;
        yield* connive(c.g, v);
      }, { text: 'Sempre que outro Villain que você controla entra, você pode fazê-lo tramar. Faça isso só uma vez por turno.' }),
    ],
  }],
  rulings: {},
});
