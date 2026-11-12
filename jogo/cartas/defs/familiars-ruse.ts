// Familiar's Ruse
// As an additional cost to cast this spell, return a creature you control to its owner's hand.
// Counter target spell.
import { additionalCost, counter, defineCard, isCreature, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Familiar's Ruse",
  faces: [{
    // CR 601.2b, 601.2h: custo adicional obrigatório
    additionalCosts: [additionalCost('devolver', 'Devolver uma criatura que você controla à mão do dono', [
      { k: 'returnPermanent', filter: (c, id) => isCreature(c.g, id), label: 'uma criatura que você controla' },
    ])],
    spell: {
      // ruling 1: precisa de uma mágica alvo e não pode mirar a si mesma (CR 115.5)
      targets: [t.spell()],
      *effect(c) { const id = tgt(c); if (id !== null) yield* counter(c.g, id); },
    },
  }],
  rulings: { 1: 'teste: sem mágica na pilha não dá para conjurar; devolve uma criatura e anula a mágica' },
});
