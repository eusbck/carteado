// Lord of the Nazgûl
// Flying
// Wraiths you control have protection from Ring-bearers.
// Whenever you cast an instant or sorcery spell, create a 3/3 black Wraith creature token with menace. Then if you control
// nine or more Wraiths, Wraiths you control have base power and toughness 9/9 until end of turn.
import { and, anthem, controlledBy, createTokens, defineCard, is, isSubtype, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Lord of the Nazgûl',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 701.54e: proteção contra Portadores do Anel
      anthem(and(is.subtype('Wraith'), is.yours), () => [{ k: 'addKeyword', kw: 'protection', param: 'ringbearer' }], 'Os Wraiths que você controla têm proteção contra Portadores do Anel.'),
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        yield* createTokens(c.g, c.you, 'Wraith', 1);
        // "depois, se": conferido na resolução; vale para os Wraiths que você controla nesse momento (CR 611.2c)
        const espectros = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Wraith'));
        if (espectros.length >= 9) untilEndOfTurn(c, espectros, [{ k: 'setPT', p: 9, t: 9 }]);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, crie uma ficha de criatura Wraith 3/3 preta com ameaçar. Depois, se você controla nove ou mais Wraiths, os Wraiths que você controla têm força e resistência base 9/9 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
