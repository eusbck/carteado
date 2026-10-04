// Hornet Nest
// Defender
// Whenever this creature is dealt damage, create that many 1/1 green Insect creature tokens with flying and deathtouch.
import { createTokens, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Hornet Nest',
  faces: [{
    abilities: [
      keyword('defender'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source && e.amount > 0 ? { amount: e.amount } : false), function* (c) {
        yield* createTokens(c.g, c.you, 'Insect voador', c.event.amount as number);
      }, { text: 'Sempre que esta criatura sofre dano, crie essa mesma quantidade de fichas de criatura Insect verdes 1/1 com voar e toque mortífero.' }),
    ],
  }],
  rulings: { 1: 'teste: dispara mesmo com dano letal' },
});
