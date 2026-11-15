// Three Steps Ahead
// Spree (Choose one or more additional costs.)
// + {1}{U} — Counter target spell.
// + {3} — Create a token that's a copy of target artifact or creature you control.
// + {2} — Draw two cards, then discard a card.
import { and, copiableValues, counter, createTokens, defineCard, is, loot, or, spreeModos, t, tgt } from '../../motor/api.ts';

const SPREE = spreeModos([
  {
    cost: '{1}{U}', text: 'Anule a mágica alvo', targets: [t.spell()],
    *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
  },
  {
    cost: '{3}', text: 'Crie uma ficha que seja uma cópia do artefato ou criatura alvo que você controla',
    targets: [t.permanent(and(is.yours, or(is.artifact, is.creature)), 'artefato ou criatura alvo que você controla')],
    *effect(c) { const id = tgt(c); if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1); },
  },
  { cost: '{2}', text: 'Compre duas cartas, depois descarte uma carta', *effect(c) { yield* loot(c, c.you, 2, 1); } },
]);
const FARRA = 'regra geral: CR 702.172a — escolhe um ou mais modos ao conjurar, cada um uma vez, pagando os respectivos custos (motor/cedh.ts)';

export default defineCard({
  name: 'Three Steps Ahead',
  faces: [{ additionalCosts: SPREE.additionalCosts, spell: { modes: SPREE.modes } }],
  rulings: {
    1: 'teste: CR 608.2b: se todos os alvos ficam ilegais, o modo de compra também não acontece',
    2: 'teste: a ficha copia as características impressas, sem marcadores ou efeitos temporários',
    3: 'regra geral: CR 202.3e, 707.2 — X fora da pilha vale zero (motor/chars.ts, motor/criaturas.ts)',
    4: 'teste: pode copiar uma ficha',
    5: 'teste: copiar uma permanente que já é cópia preserva seus valores copiados',
    6: 'teste: a ficha também dispara a habilidade de entrada da criatura copiada',
    7: 'não se aplica: o sinal + é um lembrete sem significado de regra',
    8: 'não se aplica: o sinal + é um lembrete sem significado de regra',
    9: FARRA,
    10: FARRA,
    11: 'regra geral: CR 700.2a — modo com alvo exige um alvo legal (motor/stack.ts)',
    12: 'teste: os três modos resolvem na ordem escrita, pagando oito manas e mantendo valor de mana 1',
    13: FARRA,
    14: 'teste: os três modos resolvem na ordem escrita, pagando oito manas e mantendo valor de mana 1',
    15: 'regra geral: CR 608.2 — ninguém recebe prioridade entre os modos (motor/stack.ts)',
    16: 'teste: CR 707.10: a cópia conserva os modos e os custos adicionais pagos',
    17: 'teste: CR 608.2b: com um alvo legal, o modo de compra acontece mesmo que outro alvo fique ilegal',
    18: 'teste: conjurar sem pagar o custo de mana exige pagar o custo do modo escolhido',
  },
});
