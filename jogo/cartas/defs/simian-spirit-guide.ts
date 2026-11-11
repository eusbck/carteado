// Simian Spirit Guide
// Exile this card from your hand: Add {R}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Simian Spirit Guide',
  faces: [{
    abilities: [
      // habilidade de mana que funciona da mão (CR 113.6, 605.1a): não usa a pilha
      { ...mana('R', { cost: 'Exile this card from your hand', text: 'Exile este card da sua mão: Adicione {R}.' }), zones: ['hand'] },
    ],
  }],
  rulings: { 1: 'regra geral: CR 601.2g — habilidades de mana são ativadas antes de pagar os custos; a carta devolvida no custo já não paga' },
});
