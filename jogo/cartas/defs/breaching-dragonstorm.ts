// Breaching Dragonstorm
// When this enchantment enters, exile cards from the top of your library until you exile a nonland card. You may cast
// it without paying its mana cost if that spell's mana value is 8 or less. If you don't, put that card into your hand.
// When a Dragon you control enters, return this enchantment to its owner's hand.
import { and, defineCard, etb, is, isLand, manaValue, mayCastFree, moveObjects, nameOf, on, returnToHand, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Breaching Dragonstorm',
  faces: [{
    abilities: [
      etb(function* (c) {
        const g = c.g;
        const lib = g.state.zones.library[c.you];
        const i = lib.findIndex((id) => !isLand(g, id));
        const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        if (!tiradas.length) return;
        g.log(`Breaching Dragonstorm: ${g.state.players[c.you].name} exila ${tiradas.map((id) => nameOf(g, id)).join(', ')}.`);
        const novos = (yield* moveObjects(g, tiradas.map((id) => ({ id, to: 'exile' as const })), 'effect')).filter((x): x is ObjId => x !== null);
        const achada = i < 0 ? null : novos[novos.length - 1] ?? null;
        if (achada === null || g.state.objects[achada]?.zone !== 'exile') return;
        // rulings 1-3: conjura durante a resolução, sem pagar o custo de mana (X vale 0), ignorando o tempo da carta
        const conjurou = manaValue(g, achada) <= 8 && (yield* mayCastFree(g, c.you, achada, `Breaching Dragonstorm: conjurar ${nameOf(g, achada)} sem pagar o custo de mana? (senão, ela vai para a sua mão)`));
        if (!conjurou && g.state.objects[achada]?.zone === 'exile') yield* moveObjects(g, [{ id: achada, to: 'hand' }], 'effect');
      }, { text: 'Quando este encantamento entra, exile cartas do topo do seu grimório até exilar uma carta que não seja terreno. Você pode conjurá-la sem pagar o custo de mana se o valor de mana da mágica for 8 ou menos. Se não conjurar, coloque essa carta na sua mão.' }),
      triggered(on.enters(and(is.yours, is.subtype('Dragon'))), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* returnToHand(c.g, [c.source]);
      }, { text: 'Quando um Dragon que você controla entra, devolva este encantamento para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'teste: exila até uma carta que não é terreno e a conjura de graça durante a resolução',
    2: 'regra geral: CR 118.9 — conjurar sem pagar o custo de mana é custo alternativo (motor/mecanicas.ts mayCastFree)',
    3: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
  },
});
