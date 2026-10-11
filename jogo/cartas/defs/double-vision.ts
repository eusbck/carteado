// Double Vision
// Whenever you cast your first instant or sorcery spell each turn, copy that spell. You may choose new targets for the
// copy.
import { copySpell, defineCard, is, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Double Vision',
  faces: [{
    abilities: [
      // ruling 1: conta as mágicas do turno inteiro, mesmo as conjuradas antes de Double Vision entrar
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && e.player === c.you && !!c.g.state.objects[e.obj] && is.instantOrSorcery(c, e.obj)
        && c.g.state.turnStats[c.you].instantSorceryCast === 1 ? { spell: e.obj } : false)), function* (c) {
        // ruling 3 (CR 707.10): copia mesmo que a mágica já tenha sido anulada; a cópia resolve antes da original
        yield* copySpell(c.g, c.event.spell as ObjId, c.you, { newTargets: true });
      }, { text: 'Sempre que você conjura a sua primeira mágica instantânea ou feitiço em cada turno, copie essa mágica. Você pode escolher novos alvos para a cópia.' }),
    ],
  }],
  rulings: {
    1: 'teste: a segunda instantânea ou feitiço do turno não é copiada, nem a primeira se já tinha sido conjurada antes de ela entrar',
    2: 'teste: copia a primeira instantânea ou feitiço do turno, com ou sem alvos; a cópia resolve antes',
    3: 'teste: a cópia é criada mesmo que a mágica original seja anulada',
    4: 'regra geral: CR 707.10c — os alvos da cópia podem ser trocados, todos ou nenhum (motor/stack.ts copySpell)',
    5: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    6: 'regra geral: CR 707.10 — a cópia tem o mesmo X (motor/stack.ts copySpell)',
    7: 'regra geral: CR 707.10 — a cópia leva os custos adicionais pagos na original (motor/stack.ts copySpell)',
    8: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});
