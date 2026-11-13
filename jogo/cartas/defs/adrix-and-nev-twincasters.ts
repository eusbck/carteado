// Adrix and Nev, Twincasters
// Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless
// that player pays {2}.)
// If one or more tokens would be created under your control, twice that many of those tokens are created instead.
import { defineCard, staticAbility, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Adrix and Nev, Twincasters',
  faces: [{
    abilities: [
      ...ward('{2}'),
      // CR 614.1a, 616.1f: substituição na criação de fichas (como Parallel Lives)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Adrix and Nev: o dobro das fichas',
            // ruling 1: o resto do pedido (virada, atacando, marcadores) acompanha as fichas novas
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((t) => ({ ...t }))] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, o dobro dessas fichas é criado em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: as fichas a mais entram como as originais (viradas)',
    2: 'regra geral: CR 702.21a — cada resguardo dispara por alvo; sem pagar todos, a mágica é anulada (motor/dsl.ts ward)',
  },
});
