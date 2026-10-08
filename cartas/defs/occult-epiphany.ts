// Occult Epiphany
// Draw X cards, then discard X cards. Create a 1/1 white Spirit creature token with flying for each card type among
// cards discarded this way.
import { createTokens, defineCard, discard, draw, lkiChars } from '../../motor/api.ts';

/** tipos de carta (CR 205.2a); supertipos e subtipos não contam (ruling 1) */
const TIPOS_DE_CARTA = ['Artifact', 'Battle', 'Conspiracy', 'Creature', 'Dungeon', 'Enchantment', 'Instant', 'Kindred', 'Land', 'Phenomenon', 'Plane', 'Planeswalker', 'Scheme', 'Sorcery', 'Vanguard'];

export default defineCard({
  name: 'Occult Epiphany',
  faces: [{
    spell: {
      *effect(c) {
        yield* draw(c.g, c.you, c.x);
        const descartadas = yield* discard(c.g, c.you, c.x);
        const tipos = new Set<string>();
        for (const id of descartadas) for (const tp of lkiChars(c.g, id)?.types ?? []) if (TIPOS_DE_CARTA.includes(tp)) tipos.add(tp);
        yield* createTokens(c.g, c.you, 'Spirit 1/1', tipos.size);
      },
    },
  }],
  rulings: {
    1: 'teste: conta os tipos de carta (artefato e criatura contam dois), não supertipos nem subtipos',
  },
});
