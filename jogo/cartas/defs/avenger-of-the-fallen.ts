// Avenger of the Fallen
// Deathtouch
// Mobilize X, where X is the number of creature cards in your graveyard.
import { defineCard, isCreature, keyword, mobilize } from '../../motor/api.ts';

export default defineCard({
  name: 'Avenger of the Fallen',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // ruling 1: X é contado quando a habilidade resolve
      mobilize((c) => c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length, 'X (cartas de criatura no seu cemitério)'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2h — X é contado quando a habilidade resolve',
    2: 'regra geral: CR 702.181a — as fichas entram atacando, sem terem sido declaradas',
    3: 'regra geral: CR 702.181a — são sacrificadas no início da próxima etapa final',
  },
});
