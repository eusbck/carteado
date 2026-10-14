// Wojek Investigator
// Flying, vigilance
// At the beginning of your upkeep, investigate once for each opponent who has more cards in hand than you. (To
// investigate, create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")
import { defineCard, investigate, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Wojek Investigator',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      triggered(on.upkeep('you'), function* (c) {
        const g = c.g;
        const minha = g.state.zones.hand[c.you].length;
        const n = g.opponents(c.you).filter((p) => !g.state.players[p].left && g.state.zones.hand[p].length > minha).length;
        if (n > 0) yield* investigate(g, c.you, n);
      }, { text: 'No início da sua manutenção, investigue uma vez para cada oponente que tiver mais cartas na mão que você.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: Clue é um tipo de artefato (cartas/fichas.ts)',
    2: 'não se aplica: nenhuma carta dos decks sacrifica Clues que não sejam fichas',
    3: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    4: 'não se aplica: o investigar de Wojek Investigator não tem alvo',
    5: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma Clue',
  },
});
