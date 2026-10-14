// Aeronaut Admiral
// Flying
// Vehicles you control have flying.
import { and, anthem, defineCard, is, keyword } from '../../motor/api.ts';
import { ehVeiculo } from '../veiculos.ts';

export default defineCard({
  name: 'Aeronaut Admiral',
  faces: [{
    abilities: [
      keyword('flying'),
      anthem(and(is.yours, (c, id) => ehVeiculo(c.g, id)), () => [{ k: 'addKeyword', kw: 'flying' }], 'Os Veículos que você controla têm voar.'),
    ],
  }],
  rulings: {},
});
