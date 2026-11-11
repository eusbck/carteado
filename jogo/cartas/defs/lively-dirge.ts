// Lively Dirge
// Spree (Choose one or more additional costs.)
// + {1} — Search your library for a card, put it into your graveyard, then shuffle.
// + {2} — Return up to two creature cards with total mana value 4 or less from your graveyard to the battlefield.
import { ask, chars, defineCard, manaValue, nameOf, putOntoBattlefield, spree } from '../../motor/api.ts';
import type { Answer } from '../../motor/types.ts';
import { tutor } from '../cedh.ts';

const SPREE = spree([
  { cost: '{1}', text: 'Procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe', *effect(c) { yield* tutor(c, 'graveyard'); } },
  {
    cost: '{2}', text: 'Devolva até duas cartas de criatura com valor de mana total 4 ou menos do seu cemitério ao campo',
    *effect(c) {
      const g = c.g;
      // ruling 2: sem alvo; escolhe na resolução, inclusive a carta posta no cemitério pelo primeiro modo
      const cands = g.state.zones.graveyard[c.you].filter((id) => chars(g, id).types.includes('Creature') && manaValue(g, id) <= 4);
      if (!cands.length) return;
      const valida = (a: Answer) => (a.kind === 'select' && a.ids.reduce((n, id) => n + manaValue(g, Number(id)), 0) > 4 ? 'O valor de mana total precisa ser 4 ou menos' : null);
      const r = yield* ask<Extract<Answer, { kind: 'select' }>>(g, {
        kind: 'select', player: c.you, prompt: 'Lively Dirge: escolha até duas cartas de criatura com valor de mana total 4 ou menos',
        items: cands.map((id) => ({ id: String(id), label: `${nameOf(g, id)} (${manaValue(g, id)})`, obj: id, card: { def: g.state.objects[id].def } })), min: 0, max: 2,
      }, valida);
      if (r.ids.length) yield* putOntoBattlefield(g, r.ids.map((id) => ({ id: Number(id), controller: c.you })), 'effect');
    },
  },
]);

export default defineCard({
  name: 'Lively Dirge',
  faces: [{
    additionalCosts: SPREE.additionalCosts,
    spell: { modes: SPREE.modes },
  }],
  rulings: {
    1: 'regra geral: CR 107.3 — {X} vale 0 fora da pilha (motor/chars.ts)',
    2: 'teste: os dois modos: a carta buscada pode voltar com o segundo',
    3: 'não se aplica: o sinal + não tem significado de regra',
    4: 'não se aplica: o sinal + não tem significado de regra',
    5: 'teste: escolhe pelo menos um modo e paga o custo dele',
    6: 'regra geral: CR 700.2 — os modos são escolhidos ao conjurar e não mudam (motor/stack.ts)',
    7: 'regra geral: CR 700.2 — modo com alvo só é escolhido com alvo legal (motor/stack.ts chooseModes)',
    8: 'regra geral: CR 700.2 — os modos resolvem na ordem escrita (motor/stack.ts)',
    9: 'regra geral: CR 702.172a — cada modo uma vez só (motor/cedh.ts spree)',
    10: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/stack.ts)',
    11: 'regra geral: CR 608.2 — ninguém age entre os modos de uma mágica resolvendo',
    12: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    13: 'regra geral: CR 608.2b — com todos os alvos ilegais, não resolve',
    14: 'regra geral: CR 702.172a — sem pagar o custo de mana, os custos dos modos continuam sendo pagos (motor/stack.ts)',
  },
});
