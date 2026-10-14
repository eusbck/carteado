// Linvala, the Preserver
// Flying
// When Linvala enters, if an opponent has more life than you, you gain 5 life.
// When Linvala enters, if an opponent controls more creatures than you, create a 3/3 white Angel creature token with
// flying.
import { createTokens, creaturesOf, defineCard, etb, gainLife, keyword } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const maisVida = (c: SCtx) => c.g.opponents(c.you).some((p) => !c.g.state.players[p].left && c.g.state.players[p].life > c.g.state.players[c.you].life);
const maisCriaturas = (c: SCtx) => c.g.opponents(c.you).some((p) => !c.g.state.players[p].left && creaturesOf(c.g, p).length > creaturesOf(c.g, c.you).length);

export default defineCard({
  name: 'Linvala, the Preserver',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 603.4: condições intervenientes, conferidas ao disparar e ao resolver (rulings 1-2)
      etb(function* (c) { gainLife(c.g, c.you, 5, c.source); }, { condition: maisVida, text: 'Quando Linvala entra, se um oponente tiver mais vida que você, você ganha 5 de vida.' }),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Angel 3/3', 1); }, { condition: maisCriaturas, text: 'Quando Linvala entra, se um oponente controlar mais criaturas que você, crie uma ficha de criatura Angel 3/3 branca com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: as condições são conferidas ao disparar e de novo ao resolver',
    2: 'regra geral: CR 603.4 — pode ser um oponente diferente em cada momento (as funções olham todos os oponentes)',
  },
});
