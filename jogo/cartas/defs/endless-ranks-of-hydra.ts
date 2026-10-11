// Endless Ranks of HYDRA
// For each opponent, you create a 2/1 black Villain creature token with menace.
// Whenever your commander enters or attacks, you may pay {1}{B}. If you do, return this card from your graveyard to your
// hand.
import { controllerOf, createTokens, defineCard, mayPay, on, returnToHand, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

/** é um comandante de p que p controla no campo? */
function comandanteDe(g: G, id: ObjId, p: PlayerId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'battlefield' && o.owner === p && o.card !== null && !!g.state.cards[o.card]?.isCommander && controllerOf(g, id) === p;
}

export default defineCard({
  name: 'Endless Ranks of HYDRA',
  faces: [{
    abilities: [
      // funciona só no cemitério (CR 113.6)
      triggered(on.custom((e, c) => {
        if (e.type === 'zone') return e.to === 'battlefield' && comandanteDe(c.g, e.obj, c.you);
        if (e.type === 'attackers') return e.attackers.some((a) => comandanteDe(c.g, a.obj, c.you));
        return false;
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* mayPay(c, c.you, '{1}{B}', 'devolver Endless Ranks of HYDRA do cemitério para a sua mão')) yield* returnToHand(c.g, [c.source]);
      }, { zones: ['graveyard'], text: 'Sempre que o seu comandante entra ou ataca, você pode pagar {1}{B}. Se fizer isso, devolva esta carta do seu cemitério para a sua mão.' }),
    ],
    spell: {
      *effect(c) {
        const n = c.g.opponents(c.you).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Villain', n);
      },
    },
  }],
  rulings: {},
});
