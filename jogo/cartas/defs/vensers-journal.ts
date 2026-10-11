// Venser's Journal
// You have no maximum hand size.
// At the beginning of your upkeep, you gain 1 life for each card in your hand.
import { defineCard, gainLife, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Venser's Journal",
  faces: [{
    abilities: [
      staticAbility({ rules: { noMaxHandSize: (c, p) => p === c.you }, text: 'Você não tem tamanho máximo de mão.' }),
      triggered(on.upkeep('you'), function* (c) {
        const n = c.g.state.zones.hand[c.you].length;
        if (n > 0) gainLife(c.g, c.you, n, c.source);
      }, { text: 'No início da sua manutenção, você ganha 1 de vida para cada carta na sua mão.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 613.7 — efeitos que mudam o tamanho da mão se aplicam em ordem de marca de tempo; nos decks só há "sem máximo" (gancho noMaxHandSize)',
  },
});
