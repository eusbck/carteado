// T'Pring, Never Parted
// Kal-if-fee — When T'Pring enters, choose another target creature you control and target creature an opponent
// controls. You may have the chosen creatures fight each other. Whenever a creature that fought this way dies this
// turn, you draw a card.
import { controllerOf, defineAbility, defineCard, delayed, draw, etb, is, nameOf, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { luta } from '../wakanda.ts';

// "Sempre que uma criatura que lutou desta forma morre neste turno, você compra uma carta" (gatilho atrasado do turno)
const MORRE = defineAbility("T'Pring, Never Parted:morre", triggered(on.custom((e, c) => {
  if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
  const lutaram = ((c as { delayed?: { data: { lutaram?: ObjId[] } } }).delayed?.data.lutaram ?? []);
  return lutaram.includes(e.old);
}), function* (c) {
  yield* draw(c.g, c.you, 1);
}, { text: 'Sempre que uma criatura que lutou desta forma morre neste turno, você compra uma carta.' }));

export default defineCard({
  name: "T'Pring, Never Parted",
  faces: [{
    abilities: [
      etb(function* (c) {
        const sua = tgt(c, 0);
        const dela = tgt(c, 1);
        // CR 701.14b: com um dos alvos ilegal, não há luta
        if (sua === null || dela === null) return;
        if (!(yield* yesNo(c.g, c.you, `T'Pring: fazer ${nameOf(c.g, sua)} e ${nameOf(c.g, dela)} lutarem?`))) return;
        luta(c.g, sua, dela);
        delayed(c, MORRE.id!, { data: { lutaram: [sua, dela] }, once: false, expiresTurn: c.g.state.turn.number });
      }, {
        targets: [
          t.creature((c, id) => id !== c.source && is.yours(c, id), 'outra criatura alvo que você controla'),
          t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla'),
        ],
        text: "Kal-if-fee — Quando T'Pring entra, escolha outra criatura alvo que você controla e uma criatura alvo que um oponente controla. Você pode fazer as criaturas escolhidas lutarem entre si. Sempre que uma criatura que lutou desta forma morrer neste turno, você compra uma carta.",
      }),
    ],
  }],
  rulings: {},
});
