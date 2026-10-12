// Rat King, Pale Piper
// Menace
// Whenever Rat King or another nontoken creature you control leaves the battlefield, create a 1/1 black Rat creature
// token.
// {2}, Sacrifice a token: Draw a card.
import { activated, createTokens, defineCard, draw, keyword, triggered } from '../../motor/api.ts';
import { saiEuOuOutraCriaturaSua } from '../tartarugas.ts';

const COMPRA = activated('{2}', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{2}, Sacrifique uma ficha: Compre uma carta.' });
// o custo "sacrifique uma ficha" não tem texto que o analisador de custos entenda
COMPRA.cost.push({ k: 'sacrifice', n: 1, label: 'uma ficha', filter: (c, id) => !!c.g.state.objects[id]?.isToken });

export default defineCard({
  name: 'Rat King, Pale Piper',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(saiEuOuOutraCriaturaSua(), function* (c) { yield* createTokens(c.g, c.you, 'Rat', 1); }, { text: 'Sempre que Rat King ou outra criatura que não é ficha que você controla sai do campo, crie uma ficha de criatura Rat 1/1 preta.' }),
      COMPRA,
    ],
  }],
  rulings: {},
});