// Ephemerate
// Exile target creature you control, then return it to the battlefield under its owner's control.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you
// may cast this card from exile without paying its mana cost.)
import { defineCard, is, rebound, t, tgt } from '../../motor/api.ts';
import { piscar } from '../borg.ts';

export default defineCard({
  name: 'Ephemerate',
  faces: [{
    abilities: [rebound()],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'dono'); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — ficha exilada não volta (motor/sba.ts)',
    3: 'regra geral: CR 702.88a — conjurar pelo ricochete é opcional; sem conjurar, a carta fica no exílio (motor/conjurar-alternativo.ts rebound)',
    4: 'regra geral: CR 702.88a — anulada ou sem resolver, vai para o cemitério e não ricocheteia (motor/conjurar-alternativo.ts rebound)',
  },
});
