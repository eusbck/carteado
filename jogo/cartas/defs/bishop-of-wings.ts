// Bishop of Wings
// Whenever an Angel you control enters, you gain 4 life.
// Whenever an Angel you control dies, create a 1/1 white Spirit creature token with flying.
import { and, createTokens, defineCard, gainLife, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bishop of Wings',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.subtype('Angel'), is.yours)), function* (c) {
        gainLife(c.g, c.you, 4, c.source);
      }, { text: 'Sempre que um Angel que você controla entra, você ganha 4 de vida.' }),
      // ruling 1: "olha para trás" (CR 603.10a): morrendo junto com os Angels, dispara para cada um
      triggered(on.dies((c, lki) => lki.controller === c.you && lki.subtypes.includes('Angel')), function* (c) {
        yield* createTokens(c.g, c.you, 'Spirit 1/1', 1);
      }, { text: 'Sempre que um Angel que você controla morre, crie uma ficha de criatura Spirit 1/1 branca com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: morrendo junto com Angels seus, dispara para cada um',
    2: 'regra geral: CR 603.6a, 603.10a — se ele próprio for um Angel, os gatilhos valem para ele mesmo ao entrar e ao morrer',
  },
});
