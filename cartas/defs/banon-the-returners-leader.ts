// Banon, the Returners' Leader
// Pray — Once during each of your turns, you may cast a creature spell from among cards in your graveyard that were put
// there from anywhere other than the battlefield this turn.
// Whenever you attack, you may pay {1} and discard a card. If you do, draw a card.
import { defineCard, discard, draw, isCreature, on, parseCost, payMana, staticAbility, triggered, yesNo } from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';

export default defineCard({
  name: "Banon, the Returners' Leader",
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            if (!eu || p !== c.you || s.turn.active !== c.you || eu.data.banonTurno === s.turn.number) return null;
            const o = s.objects[carta];
            if (!o || o.zone !== 'graveyard' || o.owner !== c.you || o.card === null || !isCreature(c.g, carta)) return null;
            if (!s.turnStats[c.you].toGraveyardNotFromBattlefield.includes(o.card)) return null;
            const fonte = c.source;
            // ruling 1: paga os custos e segue o tempo normal
            return { key: `banon:${fonte}`, label: 'Banon (Prece)', onUse: (u) => { const b = u.g.state.objects[fonte]; if (b) { b.data.banonTurno = u.g.state.turn.number; u.g.bump(); } } };
          },
        },
        text: 'Prece — Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de criatura dentre as cartas do seu cemitério que foram para lá de qualquer lugar que não o campo neste turno.',
      }),
      triggered(on.youAttack(), function* (c) {
        const s = c.g.state;
        if (!s.zones.hand[c.you].length || !canAfford(c.g, c.you, parseCost('{1}'), { purpose: { kind: 'effect' } })) return;
        if (!(yield* yesNo(c.g, c.you, 'Banon: pagar {1} e descartar uma carta para comprar uma?'))) return;
        const pago = yield* payMana(c.g, c.you, parseCost('{1}'), { purpose: { kind: 'effect' }, canCancel: true, label: 'Banon' });
        if (!pago) return;
        const desc = yield* discard(c.g, c.you, 1);
        if (desc.length) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você ataca, você pode pagar {1} e descartar uma carta. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — paga os custos e segue o tempo normal',
  },
});
