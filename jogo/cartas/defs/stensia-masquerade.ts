// Stensia Masquerade
// Attacking creatures you control have first strike.
// Whenever a Vampire you control deals combat damage to a player, put a +1/+1 counter on it.
// Madness {2}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it
// into your graveyard.)
import { addCounters, anthem, controllerOf, defineCard, is, isAttacking, isSubtype, madness, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Stensia Masquerade',
  faces: [{
    abilities: [
      anthem((c, id) => is.yours(c, id) && is.creature(c, id) && isAttacking(c.g, id), () => [{ k: 'addKeyword', kw: 'first strike' }], 'As criaturas atacantes que você controla têm iniciativa.'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'damage' || !e.combat || e.amount <= 0 || e.target.kind !== 'player') return false;
        const o = c.g.state.objects[e.source];
        if (!o || o.zone !== 'battlefield' || controllerOf(c.g, e.source) !== c.you || !isSubtype(c.g, e.source, 'Vampire')) return false;
        return { vampiro: e.source };
      }), function* (c) {
        const id = c.event.vampiro as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um Vampire que você controla causa dano de combate a um jogador, coloque um marcador +1/+1 nele.' }),
      // CR 702.35: descartada, vai para o exílio e pode ser conjurada por {2}{R}
      madness('{2}{R}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.35a — descartada durante uma resolução, vai para o exílio e o gatilho vem depois (testes/regras-conjurar.test.ts)',
    2: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    3: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    4: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    5: 'teste: conjurada pela loucura no turno de outro jogador, entra no campo',
    6: 'teste: conjurada pela loucura no turno de outro jogador, entra no campo',
    7: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    8: 'teste: sem conjurar, vai para o cemitério',
    9: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima da mágica paga com o descarte (testes/regras-conjurar.test.ts)',
    10: 'regra geral: CR 702.7c — ganhar ou perder iniciativa depois do primeiro dano não muda quem já causou dano (motor/combat.ts)',
  },
});
