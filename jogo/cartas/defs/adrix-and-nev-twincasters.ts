// Adrix and Nev, Twincasters
// Ward {2}
// If one or more tokens would be created under your control, twice that many of those tokens are created instead.
import { defineCard, staticAbility, ward } from '../../motor/api.ts';

export default defineCard({
  name: 'Adrix and Nev, Twincasters',
  faces: [{
    abilities: [
      ...ward('{2}'),
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Adrix and Nev: o dobro das fichas',
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((x) => ({ ...x }))] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, o dobro dessas fichas é criado em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 616.1 — com outros efeitos de dobrar, cada um dobra',
    2: 'regra geral: CR 111.1 — vale para qualquer ficha criada sob o seu controle, por qualquer efeito',
  },
});
