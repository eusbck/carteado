// Terramorph
// Search your library for a basic land card, put it onto the battlefield, then shuffle.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { chars, defineCard, isLand, rebound, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Terramorph',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      *effect(c) {
        // CR 701.23: entra desvirada (o texto não diz "virado")
        yield* searchTo(c, c.you, (id) => isLand(c.g, id) && chars(c.g, id).supertypes.includes('Basic'), 1, 'battlefield', { tapped: false, prompt: 'Procure uma carta de terreno básico' });
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.88a: ricochete — na sua próxima manutenção busca outro terreno, sem pagar, e vai para o cemitério',
    2: 'regra geral: CR 702.88a — anulada, a mágica vai para o cemitério e não ricocheteia (cartas/defs/recurring-insight.test.ts)',
  },
});
