// Galvanic Iteration
// When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.
// Flashback {1}{U}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { copySpell, defineAbility, defineCard, delayed, flashback, is, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const COPIA = defineAbility('Galvanic Iteration:copia', triggered({
  kind: 'event',
  match: (e, c) => (e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj) ? { spell: e.obj } : false),
}, function* (c) {
  // rulings 7-8, 11-14: cópia na pilha (não conjurada), com os mesmos modos, X e custos pagos; copia mesmo se a mágica já foi anulada
  yield* copySpell(c.g, c.event.spell as ObjId, c.you, { newTargets: true });
}, { text: 'Quando você conjurar a próxima mágica instantânea ou de feitiço neste turno, copie-a. Você pode escolher novos alvos para a cópia.' }));

export default defineCard({
  name: 'Galvanic Iteration',
  faces: [{
    altCosts: [flashback('{1}{U}{R}')],
    spell: {
      *effect(c) {
        // CR 603.7: gatilho atrasado que dispara uma vez e vale só neste turno
        delayed(c, COPIA.id!, { once: true, expiresTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — a permissão vale assim que a carta está no cemitério (motor/priority.ts)',
    2: 'regra geral: CR 702.34a — custo alternativo e exílio ao sair da pilha (motor/dsl.ts flashback, motor/actions.ts exileOnLeave)',
    3: 'teste: conjurada pela retrospectiva, é exilada e copia a mágica seguinte',
    4: 'regra geral: CR 702.34a — a retrospectiva vale para a carta no cemitério, tenha ela sido conjurada antes ou não',
    5: 'regra geral: CR 702.34a — segue as permissões de tempo do tipo da carta (motor/priority.ts)',
    6: 'regra geral: CR 601.2f — o custo de retrospectiva é o custo alternativo; aumentos e reduções se aplicam a ele (motor/stack.ts totalSpellCost)',
    7: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    8: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
    9: 'teste: copia a próxima mágica instantânea ou de feitiço que você conjurar no turno, uma vez só',
    10: 'teste: duas Galvanic Iteration seguidas: a segunda é copiada e a mágica seguinte é copiada duas vezes',
    11: 'regra geral: CR 707.10 — a cópia tem o mesmo valor de X (motor/stack.ts copySpell)',
    12: 'regra geral: CR 707.10 — os custos adicionais pagos são copiados (motor/stack.ts copySpell)',
    13: 'regra geral: CR 707.10 — copia pela última informação se a mágica já saiu da pilha, e a cópia resolve antes (motor/stack.ts copySpell)',
    14: 'regra geral: CR 707.10c — pode trocar qualquer número de alvos (motor/stack.ts copySpell)',
  },
});
