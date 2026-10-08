// Wingmantle Chaplain
// Defender
// When this creature enters, create a 1/1 white Bird creature token with flying for each creature with defender you
// control.
// Whenever another creature you control with defender enters, create a 1/1 white Bird creature token with flying.
import { and, controlledBy, createTokens, defineCard, etb, hasKw, is, isCreature, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Wingmantle Chaplain',
  faces: [{
    abilities: [
      keyword('defender'),
      etb(function* (c) {
        // ruling 2: conta na resolução, inclusive ela mesma
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && hasKw(c.g, id, 'defender')).length;
        yield* createTokens(c.g, c.you, 'Bird', n);
      }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Bird branca 1/1 com voar para cada criatura com defensor que você controla.' }),
      triggered(on.enters(and(is.creature, is.yours, is.other, is.kw('defender'))), function* (c) { yield* createTokens(c.g, c.you, 'Bird', 1); }, {
        text: 'Sempre que outra criatura com defensor que você controla entra, crie uma ficha de criatura Bird branca 1/1 com voar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.6a — entrando junto, cada gatilho dispara uma vez por criatura',
    2: 'teste: conta na resolução, inclusive ela mesma',
  },
});
