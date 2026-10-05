// Storm-Kiln Artist
// This creature gets +1/+0 for each artifact you control.
// Magecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.
import { controlledBy, createTokens, defineCard, isType, magecraft, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Storm-Kiln Artist',
  faces: [{
    abilities: [
      selfGets((c) => [{ k: 'pt', p: controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length, t: 0 }], 'Esta criatura recebe +1/+0 para cada artefato que você controla.'),
      magecraft(function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 1); }, 'Sempre que você conjura ou copia uma mágica instantânea ou feitiço, crie uma ficha de Tesouro.'),
    ],
  }],
  rulings: {
    1: 'teste: copiar a mágica dispara (Plumb the Forbidden)',
    2: 'regra geral: CR 707.12 — copiar carta fora da pilha não é copiar mágica',
    3: 'teste: cada cópia dispara uma vez (Plumb the Forbidden)',
    4: 'regra geral: cada habilidade de magecraft tem o próprio efeito',
  },
});
