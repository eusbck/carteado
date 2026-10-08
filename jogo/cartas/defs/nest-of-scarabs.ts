// Nest of Scarabs
// Whenever you put one or more -1/-1 counters on a creature, create that many 1/1 black Insect creature tokens.
import { createTokens, defineCard, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Nest of Scarabs',
  faces: [{
    abilities: [
      // ruling 2: murchar e infectar põem marcadores pelo controlador da fonte
      triggered(on.custom((e, c) => (e.type === 'counters' && e.kind === '-1/-1' && e.amount > 0 && e.by === c.you && e.target.kind === 'obj' && !!c.g.state.objects[e.target.id] && isCreature(c.g, e.target.id) ? { n: e.amount } : false)), function* (c) {
        yield* createTokens(c.g, c.you, 'Insect', c.event.n as number);
      }, { text: 'Sempre que você coloca um ou mais marcadores -1/-1 numa criatura, crie essa quantidade de fichas de criatura Insect pretas 1/1.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta todos os marcadores, mesmo além da resistência',
    2: 'teste: dano de murchar conta',
  },
});
