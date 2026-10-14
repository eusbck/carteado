// Raff Capashen, Ship's Mage
// Flash
// Flying
// You may cast historic spells as though they had flash. (Artifacts, legendaries, and Sagas are historic.)
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';

export default defineCard({
  name: "Raff Capashen, Ship's Mage",
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      // ruling 1: histórica é artefato, lendária ou Saga (CR 700.6)
      staticAbility({
        rules: { castAsThoughFlash: (c, jogador, carta) => jogador === c.you && ehHistorica(c.g, carta) },
        text: 'Você pode conjurar mágicas históricas como se tivessem lampejo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: no turno do oponente, conjura artefato e lendária, mas não outra criatura',
  },
});
