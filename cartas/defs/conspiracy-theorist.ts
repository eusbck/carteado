// Conspiracy Theorist
// Whenever this creature attacks, you may pay {1} and discard a card. If you do, draw a card.
// Whenever you discard one or more nonland cards, you may exile one of them from your graveyard. If you do, you may
// cast it this turn.
import { allowPlay, chooseItems, defineCard, discard, draw, exile, isLand, mayPay, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Conspiracy Theorist',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        // ruling 2: uma vez só por ataque
        if (c.g.state.zones.hand[c.you].length === 0) return;
        if (!(yield* mayPay(c, c.you, '{1}', 'descartar uma carta e comprar uma'))) return;
        const d = yield* discard(c.g, c.you, 1);
        if (d.length) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura ataca, você pode pagar {1} e descartar uma carta. Se fizer isso, compre uma carta.' }),
      triggered(on.batch((evs, c) => {
        const cartas = evs.filter((e) => e.type === 'discard' && e.player === c.you && !isLand(c.g, e.obj)).map((e) => (e as { obj: ObjId }).obj);
        return cartas.length ? { cartas } : false;
      }), function* (c) {
        const ainda = (c.event.cartas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (ainda.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, 'Conspiracy Theorist: você pode exilar uma das cartas descartadas (e conjurá-la neste turno)', ainda.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (pick.length === 0) return;
        const [ex] = yield* exile(c.g, [Number(pick[0])]);
        // ruling 1: conjurar segue as regras normais de tempo e custo
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: 'Sempre que você descarta uma ou mais cartas que não são terrenos, você pode exilar uma delas do seu cemitério. Se fizer isso, você pode conjurá-la neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: a carta exilada é conjurada pagando o custo, neste turno',
    2: 'regra geral: o efeito pede um pagamento só',
  },
});
