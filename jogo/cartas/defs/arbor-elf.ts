// Arbor Elf
// {T}: Untap target Forest.
import { activated, defineCard, is, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Arbor Elf',
  faces: [{
    abilities: [
      // tem alvo: não é habilidade de mana (CR 605.1a), usa a pilha
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
      }, { targets: [t.permanent(is.subtype('Forest'), 'Floresta alvo')], text: '{T}: Desvire a Floresta alvo.' }),
    ],
  }],
  rulings: {},
});
