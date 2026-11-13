// Return the Favor
// Spree (Choose one or more additional costs.)
// + {1} — Copy target instant spell, sorcery spell, activated ability, or triggered ability. You may choose new targets
// for the copy.
// + {1} — Change the target of target spell or ability with a single target.
import { chars, changeTargets, copySpell, copyStackAbility, defineCard, spreeModos, tgt } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';

// mágica de instantânea ou feitiço, ou habilidade ativada ou desencadeada na pilha (as de mana não usam a pilha)
const COPIAVEL: TargetSpec = {
  what: 'stackObject', label: 'mágica de instantânea ou feitiço, ou habilidade ativada ou desencadeada, alvo',
  filter: (c, t) => {
    if (t.kind !== 'obj') return false;
    const o = c.g.state.objects[t.id];
    if (!o?.stack) return false;
    if (o.stack.kind !== 'spell') return true;
    const tipos = chars(c.g, t.id).types;
    return tipos.includes('Instant') || tipos.includes('Sorcery');
  },
};

// ruling 19: exatamente um alvo, mesmo que os outros tenham ficado ilegais
const UM_ALVO: TargetSpec = {
  what: 'stackObject', label: 'mágica ou habilidade alvo com um único alvo',
  filter: (c, t) => t.kind === 'obj' && (c.g.state.objects[t.id]?.stack?.targets.flat().length ?? 0) === 1,
};

const SPREE = spreeModos([
  {
    cost: '{1}', text: 'Copie a mágica de instantânea ou feitiço, ou a habilidade ativada ou desencadeada, alvo. Você pode escolher novos alvos para a cópia',
    targets: [COPIAVEL],
    *effect(c) {
      const id = tgt(c);
      if (id === null) return;
      // CR 707.10: a cópia tem os mesmos modos, X e custos pagos (rulings 1, 12, 15, 18); é criada na pilha, não conjurada (ruling 2)
      if (c.g.state.objects[id].stack?.kind === 'spell') yield* copySpell(c.g, id, c.you, { newTargets: true });
      else yield* copyStackAbility(c.g, id, c.you, { newTargets: true });
    },
  },
  {
    cost: '{1}', text: 'Mude o alvo da mágica ou habilidade alvo com um único alvo',
    targets: [UM_ALVO],
    *effect(c) {
      const id = tgt(c);
      // ruling 8: o alvo novo é escolhido na resolução; precisa mudar se der; sem outro legal, fica como está
      if (id !== null) yield* changeTargets(c.g, id, c.you, { mustChange: true });
    },
  },
]);

const SPREE_GERAL = 'regra geral: CR 702.172a — spree: um ou mais modos, cada um uma vez, pagando o custo de cada (motor/cedh.ts spreeModos)';

export default defineCard({
  name: 'Return the Favor',
  faces: [{
    additionalCosts: SPREE.additionalCosts,
    spell: { modes: SPREE.modes },
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell, copyStackAbility)',
    2: 'regra geral: CR 707.12 — a cópia é criada na pilha, não é conjurada nem ativada (motor/stack.ts copySpell)',
    3: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/chars.ts)',
    4: 'regra geral: CR 707.10c — a divisão e o número de alvos da cópia não mudam (motor/stack.ts copySpell)',
    5: 'não se aplica: o sinal + não tem significado de regra',
    6: SPREE_GERAL,
    7: 'regra geral: CR 700.2 — os modos são escolhidos ao conjurar e não mudam (motor/stack.ts)',
    8: 'teste: muda o alvo da mágica do oponente para outra criatura',
    9: 'regra geral: CR 608.2 — ninguém age entre os modos de uma mágica resolvendo',
    10: 'não se aplica: o sinal + não tem significado de regra',
    11: 'regra geral: CR 608.2b — com todos os alvos ilegais, não resolve (motor/stack.ts)',
    12: 'regra geral: CR 707.10 — a cópia de habilidade usa as escolhas do custo da original (motor/stack.ts copyStackAbility)',
    13: 'regra geral: CR 700.2 — os modos resolvem na ordem escrita (motor/stack.ts)',
    14: 'teste: copia a instantânea do oponente e escolhe outro alvo para a cópia',
    15: 'regra geral: CR 707.10 — a cópia tem o mesmo X (motor/stack.ts copySpell)',
    16: SPREE_GERAL,
    17: 'regra geral: CR 700.2a — modo com alvo só é escolhido com alvo legal (motor/stack.ts chooseModes)',
    18: 'regra geral: CR 707.10 — custos adicionais pagos pela original valem para a cópia, que não paga nenhum (motor/stack.ts copySpell)',
    19: 'regra geral: CR 115.7 — o segundo modo só mira mágica ou habilidade com exatamente um alvo (filtro UM_ALVO)',
    20: 'regra geral: CR 707.10 — a cópia de uma mágica com spree tem os mesmos modos (motor/stack.ts copySpell)',
    21: SPREE_GERAL,
  },
});
