// Burnt Offering
// As an additional cost to cast this spell, sacrifice a creature.
// Add X mana in any combination of {B} and/or {R}, where X is the sacrificed creature's mana value.
import { addMana, chooseNumber, defineCard } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { sacrificaCriatura, valorDaSacrificada } from '../cedh.ts';

export default defineCard({
  name: 'Burnt Offering',
  faces: [{
    additionalCosts: [sacrificaCriatura()],
    spell: {
      *effect(c) {
        const x = valorDaSacrificada(c);
        if (x <= 0) return;
        // qualquer combinação de {B} e {R}: quantas pretas; o resto é vermelho
        const pretas = yield* chooseNumber(c.g, c.you, `Burnt Offering: quantas das ${x} manas são {B}? (o resto é {R})`, 0, x);
        addMana(c.g, c.you, [...Array(pretas).fill('B'), ...Array(x - pretas).fill('R')] as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: {
    1: 'teste: sem criatura para sacrificar, não pode ser conjurada',
    2: 'teste: sacrifica ao conjurar e adiciona X em qualquer combinação de {B} e {R}',
  },
});
