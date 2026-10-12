// Tokka & Rahzar, Unsupervised
// First strike
// Whenever another nontoken creature you control leaves the battlefield, put a +1/+1 counter on Tokka & Rahzar and
// create a Treasure token. This ability triggers only once each turn.
import { addCounters, createTokens, defineCard, keyword, triggered } from '../../motor/api.ts';
import { saiOutraCriaturaSua } from '../tartarugas.ts';

export default defineCard({
  name: 'Tokka & Rahzar, Unsupervised',
  faces: [{
    abilities: [
      keyword('first strike'),
      triggered(saiOutraCriaturaSua(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { oncePerTurn: true, text: 'Sempre que outra criatura que não é ficha que você controla sai do campo, coloque um marcador +1/+1 em Tokka & Rahzar e crie uma ficha Treasure. Esta habilidade dispara apenas uma vez por turno.' }),
    ],
  }],
  rulings: {},
});