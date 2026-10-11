// Ultimate Nullification
// As an additional cost to cast this spell, sacrifice a legendary creature.
// Exile all creatures and graveyards. Put Ultimate Nullification on the bottom of its owner's library.
import { additionalCost, allCreatures, and, defineCard, exile, is, moveObjects } from '../../motor/api.ts';

export default defineCard({
  name: 'Ultimate Nullification',
  faces: [{
    // CR 601.2h: sem criatura lendária para sacrificar, a mágica não pode ser conjurada
    additionalCosts: [additionalCost('sacrificar', 'sacrificar uma criatura lendária', [{ k: 'sacrifice', n: 1, filter: and(is.creature, is.legendary), label: 'uma criatura lendária' }])],
    spell: {
      *effect(c) {
        const s = c.g.state;
        // criaturas e cemitérios de uma vez (a criatura sacrificada no custo já está no cemitério)
        const ids = [...allCreatures(c.g), ...s.players.flatMap((_, p) => [...s.zones.graveyard[p]])];
        if (ids.length) yield* exile(c.g, ids);
        // em vez de ir para o cemitério ao terminar de resolver, vai para o fundo do grimório do dono
        if (s.objects[c.source]?.zone === 'stack' && !s.objects[c.source].copyOf) yield* moveObjects(c.g, [{ id: c.source, to: 'library', position: 'bottom' }], 'effect');
      },
    },
  }],
  rulings: {},
});
