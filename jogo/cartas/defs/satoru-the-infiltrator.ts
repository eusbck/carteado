// Satoru, the Infiltrator
// Menace
// Whenever Satoru and/or one or more other nontoken creatures you control enter, if none of them were cast or no mana
// was spent to cast them, draw a card.
import { controllerOf, defineCard, draw, isCreature, keyword, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** mana gasta para conjurar a mágica que virou este permanente (0 se não foi conjurado) */
function manaGasta(o: { data: Record<string, unknown> }): number {
  const sp = o.data.spell as { manaSpent?: { total: number } } | undefined;
  return sp?.manaSpent?.total ?? 0;
}

export default defineCard({
  name: 'Satoru, the Infiltrator',
  faces: [{
    abilities: [
      keyword('menace'),
      // CR 603.2c: um gatilho por lote de criaturas que entram juntas
      triggered(on.batch((evs, c) => {
        const s = c.g.state;
        const entram: ObjId[] = [];
        for (const e of evs) {
          if (e.type !== 'zone' || e.to !== 'battlefield') continue;
          const o = s.objects[e.obj];
          if (!o || o.zone !== 'battlefield') continue;
          if (e.obj === c.source) { entram.push(e.obj); continue; }
          if (!o.isToken && isCreature(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you) entram.push(e.obj);
        }
        if (!entram.length) return false;
        // ruling 1: qualquer mana gasta na conjuração (inclusive em custos adicionais) impede o gatilho
        return entram.every((id) => manaGasta(s.objects[id]) === 0) ? { criaturas: entram } : false;
      }), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que Satoru e/ou uma ou mais outras criaturas que não são fichas que você controla entram, se nenhuma delas foi conjurada ou nenhuma mana foi gasta para conjurá-las, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjurada pagando mana, não compra; entrando pelo ninjutsu, compra',
  },
});
