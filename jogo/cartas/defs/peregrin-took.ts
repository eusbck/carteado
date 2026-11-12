// Peregrin Took
// If one or more tokens would be created under your control, those tokens plus an additional Food token are created
// instead. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")
// Sacrifice three Foods: Draw a card.
import { activated, defineCard, draw, staticAbility } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Peregrin Took',
  faces: [{
    abilities: [
      // CR 614.1a: uma Food a mais por evento de criação (não por ficha); ela acompanha o resto do pedido (virada,
      // atacando…: ruling 5), mas não as habilidades dadas às outras fichas
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.length ? null : {
            label: 'Peregrin Took: mais uma Food',
            *replace(e) { return { ...e, tokens: [...e.tokens, { de: e.tokens[0].de, def: 'Food' }] }; },
          }),
        },
        text: 'Se uma ou mais fichas fossem ser criadas sob o seu controle, em vez disso são criadas essas fichas mais uma ficha Food.',
      }),
      activated('Sacrifice three Foods', function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sacrifique três Foods: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
    5: 'regra geral: a Food a mais herda o resto do pedido (TokenCreation.de: virada, atacando…), não as habilidades',
    6: 'regra geral: a substituição olha quem cria as fichas (TokenCreation.player), seja qual for a fonte do efeito',
    7: 'teste: criar duas fichas quaisquer cria também uma Food a mais, uma só',
  },
});
