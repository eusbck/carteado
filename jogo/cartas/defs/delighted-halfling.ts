// Delighted Halfling
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a legendary spell, and that spell can't be countered.
import { chars, defineCard, defineFn, mana, spellCantBeCountered, type G } from '../../motor/api.ts';
import type { ManaUnit } from '../../motor/types.ts';

// CR 106.6: só para conjurar mágica lendária
const SO_LENDARIA = 'Delighted Halfling:soLendaria';
defineFn(SO_LENDARIA, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && chars(g, purpose.obj).supertypes.includes('Legendary'));
// ruling 2: gasta em qualquer parte do custo, a mágica não pode ser anulada; ruling 1: a cópia pode
const NAO_ANULA = 'Delighted Halfling:naoAnula';
defineFn(NAO_ANULA, (g: G, _u: ManaUnit, purpose: { kind: string; obj?: number }) => { if (purpose.kind === 'spell' && purpose.obj !== undefined) spellCantBeCountered(g, purpose.obj); });

export default defineCard({
  name: 'Delighted Halfling',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: SO_LENDARIA, rider: NAO_ANULA, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica lendária, e essa mágica não pode ser anulada.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia é outro objeto, sem a mana gasta: pode ser anulada (motor/stack.ts counter)',
    2: 'teste: gasta numa mágica lendária, ela não pode ser anulada; numa que não é lendária, não pode ser gasta',
  },
});
