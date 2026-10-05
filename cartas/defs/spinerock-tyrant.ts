// Spinerock Tyrant
// Flying
// Wither (This deals damage to creatures in the form of -1/-1 counters.)
// Whenever you cast an instant or sorcery spell with a single target, you may copy it. If you do, those spells gain
// wither. You may choose new targets for the copy.
import { addEffect, copySpell, defineCard, is, keywords, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Spinerock Tyrant',
  faces: [{
    abilities: [
      ...keywords('flying', 'wither'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.player !== c.you) return false;
        const o = c.g.state.objects[e.obj];
        if (!o?.stack || !is.instantOrSorcery(c, e.obj)) return false;
        // "com um único alvo": exatamente um alvo, contando todos os modos
        return o.stack.targets.flat().length === 1 ? { spell: e.obj } : false;
      }), function* (c) {
        const spell = c.event.spell as ObjId;
        if (c.g.state.objects[spell]?.zone !== 'stack') return;
        if (!(yield* yesNo(c.g, c.you, `Spinerock Tyrant: copiar ${nameOf(c.g, spell)}?`))) return;
        // rulings 1-4, 6: mesmo X, modos e custos adicionais; não é conjurada; novos alvos à escolha
        const copia = yield* copySpell(c.g, spell, c.you, { newTargets: true });
        const ambas = [spell, ...(copia !== null ? [copia] : [])].filter((id) => c.g.state.objects[id]?.zone === 'stack');
        // ruling 5: dano dessas mágicas a criaturas vira marcadores -1/-1
        addEffect(c.g, { source: c.source, sourceDef: 'Spinerock Tyrant', controller: c.you, duration: { kind: 'permanent' }, affected: ambas, mods: [{ k: 'addKeyword', kw: 'wither' }] });
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço com um único alvo, você pode copiá-la. Se fizer isso, essas mágicas ganham murchar. Você pode escolher novos alvos para a cópia.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia tem o mesmo X',
    2: 'teste: a cópia pode mirar outra criatura',
    3: 'regra geral: CR 707.10 — custos adicionais pagos são copiados',
    4: 'regra geral: CR 707.10 — a cópia não é conjurada',
    5: 'teste: o dano das duas mágicas vira marcadores -1/-1',
    6: 'regra geral: CR 707.10 — a cópia tem os mesmos modos',
  },
});
