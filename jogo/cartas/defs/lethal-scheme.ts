// Lethal Scheme
// Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one
// mana of that creature's color.)
// Destroy target creature or planeswalker. Each creature that convoked this spell connives. (Draw a card, then discard a
// card. If you discarded a nonland card, put a +1/+1 counter on that creature.)
import { conniveEach, defineCard, destroy, t, tgt } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Lethal Scheme',
  faces: [{
    convoke: true,
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        // rulings 10-11: tramam uma de cada vez, na ordem que o controlador quiser; a que saiu do campo trama sem marcador
        const convocaram = (c.data.convoked as ObjId[] | undefined) ?? [];
        if (convocaram.length) yield* conniveEach(c.g, convocaram);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.51b — a convocação vem depois do custo total e não muda o valor de mana (motor/stack.ts)',
    2: 'regra geral: CR 702.51a — só criatura desvirada ajuda; a que já foi virada por mana não ajuda (cartas/defs/bloodline-bidding.test.ts)',
    3: 'regra geral: CR 702.51a — a criatura multicolorida paga {1} ou uma mana de uma das cores dela (motor/stack.ts)',
    4: 'regra geral: CR 702.51a — criatura com enjoo de invocação também ajuda (cartas/defs/bloodline-bidding.test.ts)',
    5: 'regra geral: CR 506.4 — virar a criatura não a tira do combate',
    6: 'regra geral: CR 702.51b — convocar não é custo alternativo nem adicional (motor/stack.ts)',
    7: 'regra geral: CR 702.51a — cada criatura paga uma mana do custo total; não dá para virar mais criaturas do que o custo',
    8: 'regra geral: CR 608.2 — ninguém age durante a resolução, entre o descarte e o marcador (motor/criaturas.ts connive)',
    9: 'regra geral: CR 701.50a — sem carta descartada, não há marcador (motor/criaturas.ts connive)',
    10: 'regra geral: CR 701.50c — tramam uma de cada vez, na ordem que o controlador escolher (motor/criaturas.ts conniveEach)',
    11: 'teste: destrói o alvo e cada criatura que convocou trama',
  },
});
