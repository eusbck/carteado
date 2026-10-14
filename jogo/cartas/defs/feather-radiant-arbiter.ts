// Feather, Radiant Arbiter
// Flying, lifelink
// Whenever you cast a noncreature spell that targets only Feather, you may choose any number of other creatures that
// spell could target and pay {2} for each of those creatures. If you do, for each of those creatures, copy that spell.
// The copy targets that creature. (Copies of permanent spells become tokens.)
import {
  allCreatures, chooseItems, copySpell, defineCard, emit, isCreature, isLegalTarget, keywords, nameOf, objItem, on,
  parseCost, payMana, triggered,
} from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';
import { spellTargetSpecs } from '../../motor/stack.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Feather, Radiant Arbiter',
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      // rulings 1-2: a mágica mira só Feather (todas as escolhas de alvo são ela) e nenhum outro objeto ou jogador
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.player !== c.you) return false;
        const o = c.g.state.objects[e.obj];
        if (!o?.stack || isCreature(c.g, e.obj)) return false;
        const alvos = o.stack.targets.flat();
        return alvos.length > 0 && alvos.every((r) => r.kind === 'obj' && r.id === c.source) ? { spell: e.obj } : false;
      }), function* (c) {
        const magica = c.event.spell as ObjId;
        const o = c.g.state.objects[magica];
        if (!o?.stack || o.zone !== 'stack') return;
        const { specs } = spellTargetSpecs(o, o.stack.modes, o.stack.method);
        // as outras criaturas que a mágica poderia mirar, em cada escolha de alvo que mirava Feather
        const usados = o.stack.targets.map((g, i) => (g.length ? i : -1)).filter((i) => i >= 0);
        const cands = allCreatures(c.g).filter((id) => id !== c.source
          && usados.every((i) => specs[i] && isLegalTarget(c.g, specs[i], { kind: 'obj', id }, c.you, magica)));
        if (!cands.length) return;
        // até quantas o jogador consegue pagar ({2} cada)
        let max = 0;
        while (max < cands.length && canAfford(c.g, c.you, parseCost('{2}'.repeat(max + 1)), { purpose: { kind: 'effect' } })) max++;
        if (max === 0) return;
        const esc = (yield* chooseItems(c.g, c.you, `Feather: escolha outras criaturas para copiar ${nameOf(c.g, magica)} (pague {2} por criatura)`,
          cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, max)).map(Number);
        if (!esc.length) return;
        const pago = yield* payMana(c.g, c.you, parseCost('{2}'.repeat(esc.length)), { purpose: { kind: 'effect' }, canCancel: true, label: `as cópias de ${nameOf(c.g, magica)}` });
        if (pago === null) return;
        // ruling 3: você escolhe a ordem; as cópias ficam acima da original
        for (let i = 0; i < esc.length; i++) {
          const nova = esc[i];
          const copia = yield* copySpell(c.g, magica, c.you, { semExtra: i > 0 });
          const st = copia !== null ? c.g.state.objects[copia]?.stack : null;
          if (!st) continue;
          // a cópia mira a criatura escolhida no lugar de Feather (CR 707.10c)
          st.targets = st.targets.map((g) => g.map((r) => (r.kind === 'obj' && r.id === c.source ? { kind: 'obj' as const, id: nova } : r)));
          c.g.bump();
          emit(c.g, [{ type: 'target', target: { kind: 'obj', id: nova }, by: copia!, controller: c.you, spell: true }] as GameEvent[]);
        }
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura e que mira apenas Feather, você pode escolher quaisquer outras criaturas que essa mágica poderia mirar e pagar {2} por cada uma. Se fizer isso, para cada uma delas, copie a mágica. A cópia mira essa criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: Aura conjurada em Feather: paga {2} e a cópia vira uma ficha da Aura presa à outra criatura',
    2: 'regra geral: as cópias mantêm cada escolha de alvo, trocando Feather pela criatura escolhida',
    3: 'regra geral: CR 707.10 — as cópias ficam acima da mágica original na pilha, que resolve por último',
    4: 'regra geral: CR 707.10 — cópias não são conjuradas e não disparam "sempre que você conjura"',
    5: 'regra geral: CR 707.10 — a cópia tem os mesmos modos',
    6: 'regra geral: CR 707.10 — a cópia tem o mesmo X',
    7: 'regra geral: CR 707.10 — os custos pagos da original valem para a cópia (motor/stack.ts copySpell)',
    8: 'regra geral: CR 608.2 — as escolhas da resolução são feitas por cada cópia ao resolver',
    9: 'teste: Aura conjurada em Feather: paga {2} e a cópia vira uma ficha da Aura presa à outra criatura',
    10: 'regra geral: CR 707.10f — a ficha da cópia de mágica de permanente não é "criada"',
  },
});
