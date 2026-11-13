// Astral Cornucopia
// This artifact enters with X charge counters on it.
// {T}: Choose a color. Add one mana of that color for each charge counter on this artifact.
import { defineCard, entersWithCounters, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Astral Cornucopia',
  faces: [{
    abilities: [
      // X da mágica conjurada (CR 107.3); posta no campo de outro jeito, X = 0
      entersWithCounters('charge', (_c, ev) => ev.spell?.x ?? 0),
      mana((c) => {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        return n > 0 ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array<ManaType>(n).fill(cor)) : [];
      }, { text: '{T}: Escolha uma cor. Adicione uma mana dessa cor para cada marcador de carga neste artefato.' }),
    ],
  }],
  rulings: {
    1: 'teste: com X = 2 custa {6} e entra com dois marcadores; a mana é de uma cor só, uma por marcador',
    2: 'regra geral: CR 605.1a — habilidade de mana não usa a pilha (motor/costs.ts)',
  },
});
