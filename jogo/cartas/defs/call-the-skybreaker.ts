// Call the Skybreaker
// Create a 5/5 blue and red Elemental creature token with flying.
// Retrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)
import { createTokens, defineCard, retrace } from '../../motor/api.ts';

const retracar = retrace();

export default defineCard({
  name: 'Call the Skybreaker',
  faces: [{
    // CR 702.81a: do cemitério, descartando uma carta de terreno além dos outros custos
    altCosts: [retracar.altCost],
    abilities: [retracar.ability],
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Elemental 5/5', 1); },
    },
  }],
  rulings: {
    1: 'teste: do cemitério, paga o custo de mana e descarta uma carta de terreno',
    2: 'teste: do cemitério, só no tempo de um feitiço',
    3: 'teste: ao resolver volta para o cemitério e pode ser conjurada de novo com outro terreno',
    4: 'teste: ao resolver volta para o cemitério e pode ser conjurada de novo com outro terreno',
  },
});
