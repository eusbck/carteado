// Lathliss, Dragon Queen
// Flying
// Whenever another nontoken Dragon you control enters, create a 5/5 red Dragon creature token with flying.
// {1}{R}: Dragons you control get +1/+0 until end of turn.
import { activated, and, controlledBy, createTokens, defineCard, is, isSubtype, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Lathliss, Dragon Queen',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: entrando junto com outros Dragons não ficha, dispara uma vez para cada um (CR 603.2c)
      triggered(on.enters(and(is.subtype('Dragon'), is.nontoken, is.yours, is.other)), function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon 5/5', 1);
      }, { text: 'Sempre que outro Dragon que não é ficha entra sob o seu controle, crie uma ficha de criatura Dragon vermelha 5/5 com voar.' }),
      // CR 611.2c: afeta só os Dragons que você controla na resolução
      activated('{1}{R}', function* (c) {
        untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Dragon')), [{ k: 'pt', p: 1, t: 0 }]);
      }, { text: '{1}{R}: Os Dragons que você controla recebem +1/+0 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: entrando junto com outros Dragons não ficha, dispara uma vez para cada um',
  },
});
