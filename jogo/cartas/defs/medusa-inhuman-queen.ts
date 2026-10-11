// Medusa, Inhuman Queen
// Reach, vigilance
// Whenever a player casts a noncreature spell, put a +1/+1 counter on Medusa.
import { addCounters, defineCard, keywords, triggered } from '../../motor/api.ts';
import { alguemConjuraNaoCriatura } from '../quarteto.ts';

export default defineCard({
  name: 'Medusa, Inhuman Queen',
  faces: [{
    abilities: [
      ...keywords('reach', 'vigilance'),
      triggered(alguemConjuraNaoCriatura(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um jogador conjura uma mágica que não é de criatura, coloque um marcador +1/+1 em Medusa.' }),
    ],
  }],
  rulings: {},
});
