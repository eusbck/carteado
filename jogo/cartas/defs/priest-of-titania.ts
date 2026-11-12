// Priest of Titania
// {T}: Add {G} for each Elf on the battlefield.
import { defineCard, isSubtype, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Priest of Titania',
  faces: [{
    abilities: [
      // ruling 1: conta os Elfos de todos os jogadores, inclusive ela mesma; ruling 2: é habilidade de mana (CR 605.1a)
      mana((c) => {
        const n = c.g.state.zones.battlefield.filter((id) => !c.g.state.objects[id].phasedOut && isSubtype(c.g, id, 'Elf')).length;
        return n > 0 ? [Array<ManaType>(n).fill('G')] : [];
      }, { text: '{T}: Adicione {G} para cada Elfo no campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta os Elfos de todos os jogadores, inclusive ela mesma',
    2: 'regra geral: CR 605.1a — é habilidade de mana, não usa a pilha (motor/mana.ts)',
  },
});
