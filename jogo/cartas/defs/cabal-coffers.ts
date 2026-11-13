// Cabal Coffers
// {2}, {T}: Add {B} for each Swamp you control.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Cabal Coffers',
  faces: [{
    abilities: [
      // ruling 1: conta os terrenos com o subtipo Swamp, não só os chamados Swamp
      mana((c) => {
        const n = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Swamp')).length;
        return [Array<ManaType>(n).fill('B')];
      }, { cost: '{2}, {T}', text: '{2}, {T}: Adicione {B} para cada Swamp que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta os terrenos com o subtipo Swamp',
  },
});
