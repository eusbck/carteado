// Doom Whisperer
// Flying, trample
// Pay 2 life: Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and
// the rest on top of your library in any order.)
import { activated, defineCard, keywords, lookAndArrange } from '../../motor/api.ts';

export default defineCard({
  name: 'Doom Whisperer',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      // CR 701.25a; pagar vida só com vida suficiente (CR 119.4)
      activated('Pay 2 life', function* (c) { yield* lookAndArrange(c.g, c.you, 2, 'surveil'); }, { text: 'Pague 2 de vida: Vigiar 2.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2c — as instruções são seguidas na ordem escrita',
    2: 'teste: pagando 2 de vida, vigia 2: cada carta vai para o cemitério ou fica no topo',
  },
});
