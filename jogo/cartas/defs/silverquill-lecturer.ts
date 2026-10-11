// Silverquill Lecturer
// Creature spells you cast have demonstrate. (Whenever you cast a creature spell, you may copy it. If you do, choose an
// opponent to also copy it. Each copy becomes a token.)
import { chooseItems, copySpell, defineCard, is, nameOf, on, playerItem, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Silverquill Lecturer',
  faces: [{
    abilities: [
      // demonstrar concedido (CR 702.144a): o gatilho é deste permanente, com o efeito de demonstrar da mágica
      triggered(on.youCast(is.creature), function* (c) {
        const magica = c.event.spell as ObjId;
        if (c.g.state.objects[magica]?.zone !== 'stack') return;
        // ruling 2: sem copiar, nenhum oponente copia
        if (!(yield* yesNo(c.g, c.you, `Demonstrar: copiar ${nameOf(c.g, magica)}?`))) return;
        // rulings 3-5: a cópia leva X e os custos pagos; a cópia de mágica de permanente vira ficha ao resolver
        yield* copySpell(c.g, magica, c.you, { newTargets: true });
        const ops = c.g.opponents(c.you);
        if (!ops.length) return;
        const [op] = yield* chooseItems(c.g, c.you, 'Demonstrar: escolha um oponente para também copiar a mágica', ops.map((p) => playerItem(c.g, p)), 1, 1);
        yield* copySpell(c.g, magica, Number(op.slice(1)), { newTargets: true });
      }, { text: 'As mágicas de criatura que você conjura têm demonstrar. (Sempre que você conjura uma mágica de criatura, você pode copiá-la. Se copiar, escolha um oponente para também copiá-la. Cada cópia se torna uma ficha.)' }),
    ],
  }],
  rulings: {
    1: 'teste: demonstrando uma mágica de criatura, você e o oponente escolhido ficam cada um com uma ficha cópia',
    2: 'teste: sem copiar, nenhum oponente copia',
    3: 'regra geral: CR 707.10 — a cópia tem o mesmo valor de X (motor/stack.ts copySpell)',
    4: 'regra geral: CR 707.10 — a cópia copia os custos adicionais e alternativos pagos (motor/stack.ts copySpell)',
    5: 'regra geral: CR 608.3f — a cópia de mágica de permanente vira ficha ao resolver, sem ser "criada" (motor/stack.ts)',
    6: 'regra geral: CR 702.144a — você decide copiar quando o gatilho resolve, antes da mágica original (cartas/defs/silverquill-lecturer.ts)',
    7: 'regra geral: CR 702.144a — copiando, você escolhe um oponente na hora (cartas/defs/silverquill-lecturer.ts)',
  },
});