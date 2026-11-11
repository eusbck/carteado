// Borg Scout Sphere
// When this Spacecraft enters, draw a card.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 6+.)
// 6+ | Artifact creatures you control have flying.
import { and, anthem, defineCard, draw, etb, is, station, stationLevel } from '../../motor/api.ts';

export default defineCard({
  name: 'Borg Scout Sphere',
  faces: [{
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta Espaçonave entra, compre uma carta.' }),
      station(),
      // CR 721.2b: com 6 ou mais marcadores é uma criatura 5/5, e as criaturas artefato suas voam (ela também)
      ...stationLevel(6, {
        creature: true,
        statics: [anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addKeyword', kw: 'flying' }], '6+ | As criaturas artefato que você controla têm voar.')],
        text: 'As criaturas artefato que você controla têm voar. 5/5',
      }),
    ],
  }],
  rulings: {},
});
