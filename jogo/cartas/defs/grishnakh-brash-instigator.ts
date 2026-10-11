// Grishnákh, Brash Instigator
// When Grishnákh enters, amass Orcs 2. When you do, until end of turn, gain control of target nonlegendary creature an
// opponent controls with power less than or equal to the amassed Army's power. Untap that creature. It gains haste until
// end of turn.
import { amass, and, defineAbility, defineCard, etb, gainControl, is, not, power, reflexive, t, tgt, triggered, untap, untilEndOfTurn } from '../../motor/api.ts';
import { REUNIR } from '../mordor.ts';

// ruling 1: gatilho reflexivo (CR 603.12) — o alvo é escolhido depois de reunir, já com a força do Army
const ROUBA = defineAbility('Grishnákh, Brash Instigator:rouba', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id === null) return;
  gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
  untap(c.g, id);
  untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
}, {
  targets: [t.creature(and(is.opponents, not(is.legendary), (c, id) => power(c.g, id) <= Number(c.event?.forca ?? -1)), 'criatura não lendária alvo que um oponente controla com força menor ou igual à do Army reunido')],
  text: 'Até o fim do turno, ganhe o controle da criatura não lendária alvo que um oponente controla com força menor ou igual à do Army reunido. Desvire essa criatura. Ela ganha ímpeto até o fim do turno.',
}));

export default defineCard({
  name: 'Grishnákh, Brash Instigator',
  faces: [{
    abilities: [
      etb(function* (c) {
        const exercito = yield* amass(c.g, c.you, 'Orc', 2);
        // ruling 8: o "Army reunido" é o que foi escolhido para receber os marcadores
        if (exercito !== null && c.g.state.objects[exercito]?.zone === 'battlefield') reflexive(c, ROUBA.id!, {}, { forca: power(c.g, exercito) });
      }, { text: 'Quando Grishnákh entra, reúna Orcs 2. Quando fizer isso, até o fim do turno, ganhe o controle da criatura não lendária alvo que um oponente controla com força menor ou igual à do Army reunido. Desvire essa criatura. Ela ganha ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: reúne Orcs 2 e rouba até o fim do turno uma criatura não lendária de força até a do Army',
    2: REUNIR.escrita,
    3: REUNIR.como,
    4: REUNIR.zumbis,
    5: REUNIR.varios,
    6: REUNIR.entra00,
    7: REUNIR.alvos,
    8: REUNIR.reunido,
  },
});
