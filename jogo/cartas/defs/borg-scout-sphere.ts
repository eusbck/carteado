// Borg Scout Sphere
// When this Spacecraft enters, draw a card.
// Station (It's an artifact creature at 6+.)
// 6+ | Artifact creatures you control have flying.
import { and, anthem, defineCard, draw, etb, is } from '../../motor/api.ts';
import { cargas, estacao, nivelDeEstacao } from '../estacao.ts';

export default defineCard({
  name: 'Borg Scout Sphere',
  faces: [{
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta Espaçonave entra, compre uma carta.' }),
      estacao(),
      nivelDeEstacao(6, { criatura: true }, '6+ | É uma criatura-artefato.'),
      anthem(and(is.creature, is.artifact, is.yours, (c) => cargas(c.g, c.source) >= 6), () => [{ k: 'addKeyword', kw: 'flying' }], '6+ | As criaturas-artefato que você controla têm voar.'),
    ],
  }],
  rulings: {},
});
