// Audacious Swap
// Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this spell
// and you may choose a new target for the copy.)
// The owner of target nonenchantment permanent shuffles it into their library, then exiles the top card of their
// library. If it's a land card, they put it onto the battlefield. Otherwise, they may cast it without paying its mana
// cost.
import { casualty, defineCard, exile, is, isLand, mayCastFree, moveObjects, nameOf, not, putOntoBattlefield, shuffleLibrary, t, tgt } from '../../motor/api.ts';

const baixa = casualty(2);

export default defineCard({
  name: 'Audacious Swap',
  faces: [{
    // CR 702.153a: custo adicional opcional de sacrificar + gatilho de conjuração que copia a mágica
    additionalCosts: [baixa.cost],
    abilities: [baixa.trigger],
    spell: {
      targets: [t.permanent(not(is.enchantment), 'permanente alvo que não é encantamento')],
      *effect(c) {
        const g = c.g;
        const id = tgt(c);
        if (id === null) return;
        const dono = g.state.objects[id].owner;
        yield* moveObjects(g, [{ id, to: 'library' }], 'effect');
        shuffleLibrary(g, dono);
        const topo = g.state.zones.library[dono][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(g, [topo]);
        if (ex === null || ex === undefined) return;
        // quem age é o dono do permanente: o terreno entra sob o controle dele; a mágica é ele quem conjura
        if (isLand(g, ex)) yield* putOntoBattlefield(g, [{ id: ex, controller: dono }], 'effect');
        else yield* mayCastFree(g, dono, ex, `Audacious Swap: conjurar ${nameOf(g, ex)} sem pagar o custo de mana?`);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.153a: com a baixa paga, a cópia pode ter outro alvo e resolve primeiro',
    2: 'regra geral: CR 702.153a — só uma criatura é sacrificada e a mágica é copiada uma vez (motor/conjurar-alternativo.ts casualty)',
    3: 'teste: CR 702.153a: com a baixa paga, a cópia pode ter outro alvo e resolve primeiro',
    4: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});
