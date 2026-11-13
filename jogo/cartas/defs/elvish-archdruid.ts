// Elvish Archdruid
// Other Elf creatures you control get +1/+1.
// {T}: Add {G} for each Elf you control.
import { and, anthem, defineCard, is, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { elfosDe } from '../voja.ts';

export default defineCard({
  name: 'Elvish Archdruid',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, is.other, is.subtype('Elf')), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas Elfo que você controla recebem +1/+1.'),
      // ruling 2: conta ela mesma; é habilidade de mana (ruling 1)
      mana((c) => {
        const n = elfosDe(c.g, c.you).length;
        return n > 0 ? [Array<ManaType>(n).fill('G')] : [];
      }, { text: '{T}: Adicione {G} para cada Elfo que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 605.1a — é habilidade de mana, não usa a pilha (motor/mana.ts)',
    2: 'teste: os outros Elfos seus recebem +1/+1 e a mana conta todos os seus Elfos',
  },
});
