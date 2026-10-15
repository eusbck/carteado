// Radical Idea
// Draw a card.
// Jump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs.
// Then exile this card.)
import { defineCard, draw } from '../../motor/api.ts';
import { jumpStart } from '../saque.ts';

const impulso = jumpStart();

export default defineCard({
  name: 'Radical Idea',
  faces: [{
    // CR 702.133a: do cemitério, pagando o custo de mana e descartando uma carta; depois vai para o exílio
    altCosts: [impulso.altCost],
    abilities: [impulso.ability],
    spell: {
      *effect(c) { yield* draw(c.g, c.you, 1); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.133a — impulso segue o tempo da carta (motor/priority.ts canStartCast)',
    2: 'teste: conjurada com impulso, descarta uma carta, compra e vai para o exílio; anulada, também vai para o exílio',
    3: 'não se aplica: nenhuma carta dos decks permite pagar um custo alternativo no lugar do custo de mana',
    4: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
  },
});
