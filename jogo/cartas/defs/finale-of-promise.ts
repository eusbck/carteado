// Finale of Promise
// You may cast up to one target instant card and/or up to one target sorcery card from your graveyard each with mana
// value X or less without paying their mana costs. If a spell cast this way would be put into your graveyard, exile it
// instead. If X is 10 or more, copy each of those spells twice. You may choose new targets for the copies.
import { chooseItems, copySpell, defineCard, isType, manaValue, nameOf, objItem, t, tgt, upTo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';
import { conjuraGratis } from '../roubo.ts';

/** valor de mana X ou menos; na estimativa de "dá para conjurar?" o X ainda não existe */
const ateX = (c: SCtx, id: ObjId) => { const x = (c as { x?: number }).x; return x === undefined || manaValue(c.g, id) <= x; };

export default defineCard({
  name: 'Finale of Promise',
  faces: [{
    spell: {
      targets: [
        upTo(1, t.card('graveyard', (c, id) => isType(c.g, id, 'Instant') && ateX(c, id), 'até uma carta de instantânea alvo no seu cemitério com valor de mana X ou menos')),
        upTo(1, t.card('graveyard', (c, id) => isType(c.g, id, 'Sorcery') && ateX(c, id), 'até uma carta de feitiço alvo no seu cemitério com valor de mana X ou menos')),
      ],
      *effect(c) {
        let restantes = [tgt(c, 0), tgt(c, 1)].filter((x): x is ObjId => x !== null);
        const magicas: ObjId[] = [];
        // ruling 1: conjura as duas na ordem que quiser, durante a resolução
        while (restantes.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Finale of Promise: escolha uma carta para conjurar sem pagar o custo de mana', [
            { id: '', label: magicas.length ? 'Não conjurar mais' : 'Não conjurar' },
            ...restantes.map((id) => objItem(c.g, id, nameOf(c.g, id))),
          ], 1, 1);
          if (!esc) break;
          const id = Number(esc);
          restantes = restantes.filter((x) => x !== id);
          // "se uma mágica conjurada assim fosse para o seu cemitério, exile-a em vez disso"
          const magica = yield* conjuraGratis(c, id, { exilaEmVezDoCemiterio: true });
          if (magica !== null) magicas.push(magica);
        }
        // ruling 1: depois de conjurar, com X 10 ou mais, duas cópias de cada uma (um lote de cópias por mágica)
        // As cópias vão para a pilha uma de cada vez, na ordem que o jogador quiser (a última posta resolve primeiro);
        // cada mágica é um lote de cópias para a Twinning Staff (semExtra a partir da segunda cópia dela).
        if (c.x >= 10) {
          const faltam = new Map(magicas.map((m) => [m, 2]));
          const copiadas = new Set<ObjId>();
          for (;;) {
            const vivas = [...faltam].filter(([, n]) => n > 0).map(([m]) => m);
            if (!vivas.length) break;
            let m = vivas[0];
            if (vivas.length > 1) {
              const [esc] = yield* chooseItems(c.g, c.you, 'Finale of Promise: de qual mágica é a próxima cópia a ir para a pilha? (a última posta resolve primeiro)',
                vivas.map((id) => objItem(c.g, id, `Cópia de ${nameOf(c.g, id)} (${faltam.get(id)} por pôr)`)), 1, 1);
              m = Number(esc);
            }
            faltam.set(m, (faltam.get(m) ?? 1) - 1);
            yield* copySpell(c.g, m, c.you, { newTargets: true, semExtra: copiadas.has(m) });
            copiadas.add(m);
          }
        }
      },
    },
  }],
  rulings: {
    1: 'teste: com X 10 ou mais, conjura as duas e copia cada uma duas vezes; as cópias vão para a pilha na ordem escolhida',
    2: 'não se aplica: nenhuma carta dividida de instantânea e feitiço nos decks',
    3: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    4: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
    5: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    6: 'regra geral: CR 707.10 — a divisão não muda na cópia (motor/stack.ts copySpell)',
    7: 'regra geral: CR 707.10 — a cópia leva os custos pagos na original (motor/stack.ts copySpell)',
    8: 'regra geral: CR 707.10 — as cópias não são conjuradas (motor/stack.ts copySpell)',
  },
});
