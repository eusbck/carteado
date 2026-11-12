// Camellia, the Seedmiser
// Menace
// Other Squirrels you control have menace.
// Whenever you sacrifice one or more Foods, create a 1/1 green Squirrel creature token.
// {2}, Forage: Put a +1/+1 counter on each other Squirrel you control. (To forage, exile three cards from your graveyard
// or sacrifice a Food.)
import { activated, addCounters, and, anthem, controlledBy, cost, createTokens, defineCard, is, keyword, triggered } from '../../motor/api.ts';
import { COMIDA, ehEsquilo } from '../esquilos.ts';
import { forragear, voceSacrificaComidas } from '../forragear.ts';

export default defineCard({
  name: 'Camellia, the Seedmiser',
  faces: [{
    abilities: [
      keyword('menace'),
      anthem(and(is.subtype('Squirrel'), is.yours, is.other), () => [{ k: 'addKeyword', kw: 'menace' }], 'Outros Squirrels que você controla têm ameaça.'),
      triggered(voceSacrificaComidas(), function* (c) {
        yield* createTokens(c.g, c.you, 'Squirrel', 1);
      }, { text: 'Sempre que você sacrifica uma ou mais Foods, crie uma ficha de criatura Squirrel verde 1/1.' }),
      // CR 701.61a: forragear
      activated([...cost('{2}'), forragear()], function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => x !== c.source && ehEsquilo(c.g, x) && is.creature(c, x))) {
          addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        }
      }, { text: '{2}, Forragear: Coloque um marcador +1/+1 em cada outro Squirrel que você controla. (Para forragear, exile três cartas do seu cemitério ou sacrifique uma Food.)' }),
    ],
  }],
  rulings: { 1: COMIDA.tipo, 2: COMIDA.umCusto, 3: COMIDA.piada },
});
