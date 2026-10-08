// Crashing Drawbridge
// Defender
// {T}: Creatures you control gain haste until end of turn.
import { activated, creaturesOf, defineCard, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Crashing Drawbridge',
  faces: [{
    abilities: [
      keyword('defender'),
      activated('{T}', function* (c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'haste' }]); }, {
        text: '{T}: As criaturas que você controla ganham ímpeto até o fim do turno.',
      }),
    ],
  }],
  rulings: {},
});
