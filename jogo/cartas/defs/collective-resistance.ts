// Collective Resistance
// Escalate {G} (Pay this cost for each mode chosen beyond the first.)
// Choose one or more —
// • Destroy target artifact.
// • Destroy target enchantment.
// • Target creature gains hexproof and indestructible until end of turn.
import { defineCard, destroy, escalate, modal, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Collective Resistance',
  faces: [{
    // CR 702.120a: {G} para cada modo além do primeiro; pago mesmo conjurada sem pagar o custo de mana (ruling 6)
    additionalCosts: [escalate([{ k: 'mana', cost: '{G}' }], '{G}')],
    spell: {
      // rulings 1-3: modos escolhidos de uma vez, cada um no máximo uma vez, executados na ordem impressa
      modes: modal(1, 3, [
        { text: 'Destrua o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        { text: 'Destrua o encantamento alvo', targets: [t.enchantment()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        {
          text: 'A criatura alvo ganha resistência a magia e indestrutível até o fim do turno',
          targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 700.2 — os modos são escolhidos todos ao conjurar (motor/stack.ts chooseModes)',
    2: 'regra geral: CR 700.2 — sem "pode repetir", cada modo é escolhido no máximo uma vez (motor/stack.ts chooseModes)',
    3: 'regra geral: CR 700.2 — os modos são executados na ordem impressa (motor/stack.ts)',
    4: 'regra geral: CR 608.2 — ninguém age entre os modos; os gatilhos esperam o fim da resolução (motor/triggers.ts)',
    5: 'teste: com os três modos, paga {G}{G} a mais; se o alvo de um ficar ilegal, os outros acontecem',
    6: 'regra geral: CR 702.120a — a escalada é custo adicional e é paga mesmo sem pagar o custo de mana (motor/stack.ts totalSpellCost)',
    7: 'regra geral: CR 707.10 — a cópia mantém os modos escolhidos (motor/stack.ts copySpell)',
  },
});
