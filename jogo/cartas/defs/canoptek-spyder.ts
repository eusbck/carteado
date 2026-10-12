// Canoptek Spyder
// Flying
// Fabricator Claw Array — Whenever another nontoken artifact creature or Vehicle you control enters, draw a card.
import { and, defineCard, draw, is, keyword, on, triggered } from '../../motor/api.ts';
import { ehCriaturaArtefatoOuVeiculo } from '../necrons.ts';

export default defineCard({
  name: 'Canoptek Spyder',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.enters(and(is.yours, is.other, is.nontoken, (c, id) => ehCriaturaArtefatoOuVeiculo(c.g, id))), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Fabricator Claw Array — Sempre que outra criatura artefato ou Veículo que não é ficha que você controla entra, compre uma carta.',
      }),
    ],
  }],
  rulings: {},
});