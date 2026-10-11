// Akroma's Vengeance
// Destroy all artifacts, creatures, and enchantments.
// Cycling {3} ({3}, Discard this card: Draw a card.)
import { chars, cycling, defineCard, destroy } from '../../motor/api.ts';

export default defineCard({
  name: "Akroma's Vengeance",
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const ids = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && chars(c.g, id).types.some((tp) => tp === 'Artifact' || tp === 'Creature' || tp === 'Enchantment'));
        if (ids.length) yield* destroy(c.g, ids);
      },
    },
    // ruling 1: ciclar é habilidade ativada, não mágica
    abilities: [cycling('{3}')],
  }],
  rulings: {
    1: 'teste: ciclagem {3}: descarta esta carta e compra uma',
  },
});