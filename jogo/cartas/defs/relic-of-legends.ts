// Relic of Legends
// {T}: Add one mana of any color.
// Tap an untapped legendary creature you control: Add one mana of any color.
import { defineCard, isCreature, isLegendary, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Relic of Legends',
  faces: [{
    abilities: [
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
      // o custo não usa o símbolo de virar da criatura: vale para a que acabou de chegar (ruling 1)
      {
        ...mana('any', { text: 'Vire uma criatura lendária desvirada que você controla: Adicione uma mana de qualquer cor.' }),
        cost: [{ k: 'tapCreatures', n: 1, label: 'uma criatura lendária desvirada', filter: (c, id) => isCreature(c.g, id) && isLegendary(c.g, id) }],
      },
    ],
  }],
  rulings: { 1: 'regra geral: CR 302.6 — o enjoo de invocação só impede custos com o símbolo de virar da própria criatura (motor/costs.ts tapCreatures)' },
});