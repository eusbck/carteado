// Sacrifice
// As an additional cost to cast this spell, sacrifice a creature.
// Add an amount of {B} equal to the sacrificed creature's mana value.
import { addMana, defineCard } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { sacrificaCriatura, valorDaSacrificada } from '../cedh.ts';

export default defineCard({
  name: 'Sacrifice',
  faces: [{
    additionalCosts: [sacrificaCriatura()],
    spell: {
      *effect(c) {
        // valor de mana pela última informação da criatura (CR 608.2h); terreno animado vale 0 (ruling 3)
        const n = valorDaSacrificada(c);
        if (n > 0) addMana(c.g, c.you, Array(n).fill('B') as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    2: 'teste: sacrifica ao conjurar e adiciona {B} igual ao valor de mana da criatura',
    3: 'regra geral: CR 202.3 — o valor de mana de um terreno é 0 (cartas/cedh.ts valorDaSacrificada)',
  },
});
