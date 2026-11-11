// Cabal Coffers
// {2}, {T}: Add {B} for each Swamp you control.
import { controlledBy, defineCard, isSubtype, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Cabal Coffers',
  faces: [{
    abilities: [mana((c) => [Array<ManaType>(controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Swamp')).length).fill('B')], {
      cost: '{2}, {T}', text: '{2}, {T}: Adicione {B} para cada Swamp que você controla.',
    })],
  }],
  rulings: { 1: 'regra geral: CR 305.6 — conta todo terreno com o tipo Swamp, não só os básicos' },
});
