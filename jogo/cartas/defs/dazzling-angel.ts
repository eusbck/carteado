// Dazzling Angel
// Flying
// Whenever another creature you control enters, you gain 1 life.
import { and, defineCard, gainLife, is, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Dazzling Angel',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: entrando junto com outras, dispara uma vez para cada uma delas
      triggered(on.enters(and(is.creature, is.yours, is.other)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que outra criatura que você controla entra, você ganha 1 de vida.' }),
    ],
  }],
  rulings: { 1: 'teste: entrando ao mesmo tempo que outras criaturas, dispara para cada uma delas' },
});
