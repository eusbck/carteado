// Demon of Catastrophes
// As an additional cost to cast this spell, sacrifice a creature.
// Flying, trample
import { additionalCost, defineCard, is, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Demon of Catastrophes',
  faces: [{
    // ruling 1: exatamente uma criatura, obrigatório; ruling 2: pago ao conjurar, sem respostas no meio (CR 601.2h)
    additionalCosts: [additionalCost('sacrificar', 'sacrificar uma criatura', [{ k: 'sacrifice', n: 1, filter: is.creature, label: 'uma criatura' }])],
    abilities: keywords('flying', 'trample'),
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada; sacrifica exatamente uma',
    2: 'regra geral: CR 601.2h, 601.2i — custos pagos ao conjurar, só depois os jogadores recebem prioridade (motor/stack.ts)',
  },
});
