// Towering Titan
// This creature enters with X +1/+1 counters on it, where X is the total toughness of other creatures you control.
// Sacrifice a creature with defender: All creatures gain trample until end of turn.
import { activated, allCreatures, creaturesOf, defineCard, entersWithCounters, toughness, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Towering Titan',
  faces: [{
    abilities: [
      // ruling 1: quem entra junto ainda não está no campo; ruling 2: calculado uma vez
      entersWithCounters('+1/+1', (c, ev) => creaturesOf(c.g, ev.controller).filter((id) => id !== c.source).reduce((s, id) => s + Math.max(0, toughness(c.g, id)), 0)),
      activated('Sacrifice a creature with defender', function* (c) {
        // CR 611.2c: o conjunto afetado é travado na resolução
        untilEndOfTurn(c, allCreatures(c.g), [{ k: 'addKeyword', kw: 'trample' }]);
      }, { text: 'Sacrifique uma criatura com defensor: Todas as criaturas ganham atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — quem entra ao mesmo tempo não conta',
    2: 'teste: depois de entrar, os marcadores não mudam',
  },
});
