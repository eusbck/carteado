// Clockspinning
// Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it
// resolves.)
// Choose a counter on target permanent or suspended card. Remove that counter from that permanent or card or put another
// of those counters on it.
import { addCounters, buyback, chooseOne, defineCard, nameOf, removeCounters, suspendParams, tgt } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';

/** "permanente ou carta suspensa alvo" (ruling 9: carta com suspender, no exílio, com marcador de tempo) */
const ALVO: TargetSpec = {
  what: 'object', alsoZone: 'exile', label: 'permanente ou carta suspensa alvo',
  filter: (c, t) => {
    if (t.kind !== 'obj') return false;
    const o = c.g.state.objects[t.id];
    if (!o) return false;
    if (o.zone === 'battlefield') return true;
    return o.zone === 'exile' && (o.counters.time ?? 0) > 0 && suspendParams(c.g, t.id) !== null;
  },
};

export default defineCard({
  name: 'Clockspinning',
  faces: [{
    // CR 702.27a: com a recompra paga, volta para a mão ao resolver
    additionalCosts: [buyback('{3}')],
    spell: {
      targets: [ALVO],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 15: qualquer tipo de marcador; o tipo e o "tirar ou pôr" são escolhidos na resolução. Ruling 14: sem
        // marcadores, nada acontece
        const tipos = Object.entries(c.g.state.objects[id].counters).filter(([, n]) => n > 0).map(([k]) => k);
        if (!tipos.length) return;
        const tipo = tipos.length === 1 ? tipos[0] : yield* chooseOne(c.g, c.you, `Clockspinning: escolha um marcador em ${nameOf(c.g, id)}`, tipos.map((k) => ({ id: k, label: k })));
        const acao = yield* chooseOne(c.g, c.you, `Clockspinning: tirar ou pôr um marcador ${tipo} em ${nameOf(c.g, id)}?`, [{ id: 'tirar', label: `Tirar um marcador ${tipo}` }, { id: 'por', label: `Pôr mais um marcador ${tipo}` }]);
        // ruling 11: tirar o último marcador de tempo de uma carta suspensa dispara o gatilho de conjurá-la
        if (acao === 'tirar') removeCounters(c.g, { kind: 'obj', id }, tipo, 1);
        else addCounters(c.g, { kind: 'obj', id }, tipo, 1, c.you);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — o valor de mana não muda ao conjurar sem pagar (motor/stack.ts)',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana não há custo alternativo, mas há os adicionais (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — X vale 0 sem pagar o custo de mana (motor/stack.ts)',
    4: 'regra geral: CR 702.62a — suspender (motor/mecanicas.ts suspend)',
    5: 'regra geral: CR 702.62a — suspender quando poderia conjurar (motor/priority.ts)',
    6: 'regra geral: CR 702.62a — exilada com a face para cima (motor/mecanicas.ts)',
    7: 'regra geral: CR 116.2f — suspender é ação especial (motor/priority.ts)',
    8: 'regra geral: CR 702.62a — os alvos são escolhidos ao conjurar (motor/mecanicas.ts conjurarSuspensa)',
    9: 'teste: mira uma carta suspensa no exílio e tira um marcador de tempo',
    10: 'regra geral: CR 702.62a — anulado o gatilho, nenhum marcador sai (motor/mecanicas.ts)',
    11: 'regra geral: CR 702.62a — o gatilho de conjurar dispara quando o último marcador sai, qualquer que seja a causa (motor/mecanicas.ts)',
    12: 'regra geral: CR 702.62a — anulado o segundo gatilho, a carta fica exilada sem marcadores (motor/mecanicas.ts)',
    13: 'regra geral: CR 702.62a — conjurar é opcional ao resolver o segundo gatilho (motor/mecanicas.ts conjurarSuspensa)',
    14: 'teste: um permanente sem marcadores não muda',
    15: 'teste: escolhe o tipo de marcador e se tira ou põe na resolução',
  },
});
