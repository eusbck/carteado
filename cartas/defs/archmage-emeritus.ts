// Archmage Emeritus
// Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.
import { defineCard, draw, magecraft } from '../../motor/api.ts';

export default defineCard({
  name: 'Archmage Emeritus',
  faces: [{
    abilities: [magecraft(function* (c) { yield* draw(c.g, c.you, 1); }, 'Sempre que você conjura ou copia uma mágica instantânea ou feitiço, compre uma carta.')],
  }],
  rulings: {
    1: 'teste: cada cópia dispara uma vez',
    2: 'regra geral: CR 707.12 — copiar carta fora da pilha não é copiar mágica; conjurar a cópia dispara pela conjuração',
    3: 'teste: copiar a mágica dispara',
    4: 'regra geral: cada habilidade de magecraft tem o próprio efeito',
  },
});
