// Grave Titan
// Deathtouch
// Whenever this creature enters or attacks, create two 2/2 black Zombie creature tokens.
import { createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Grave Titan',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // uma habilidade só, com dois eventos de disparo (entra ou ataca)
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 2);
      }, { text: 'Sempre que esta criatura entra ou ataca, crie duas fichas de criatura Zombie pretas 2/2.' }),
    ],
  }],
  rulings: {},
});
