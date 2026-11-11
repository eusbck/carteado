// Blood Pet
// Sacrifice this creature: Add {B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Blood Pet',
  faces: [{ abilities: [mana('B', { cost: 'Sacrifice this creature', text: 'Sacrifique esta criatura: Adicione {B}.' })] }],
  rulings: { 1: 'regra geral: CR 510.2 — o dano de combate é causado de uma vez, sem prioridade entre designar e causar' },
});
