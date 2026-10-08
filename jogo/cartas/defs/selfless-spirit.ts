// Selfless Spirit
// Flying
// Sacrifice this creature: Creatures you control gain indestructible until end of turn.
import { activated, creaturesOf, defineCard, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Selfless Spirit',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: o conjunto é fixado na resolução (CR 611.2c)
      activated('Sacrifice this creature', function* (c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'indestructible' }]); }, {
        text: 'Sacrifique esta criatura: As criaturas que você controla ganham indestrutível até o fim do turno.',
      }),
    ],
  }],
  rulings: { 1: 'teste: CR 611.2c: criaturas que você passa a controlar depois não ganham' },
});
