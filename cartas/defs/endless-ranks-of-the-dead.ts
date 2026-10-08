// Endless Ranks of the Dead
// At the beginning of your upkeep, create X 2/2 black Zombie creature tokens, where X is half the number of Zombies
// you control, rounded down.
import { controlledBy, createTokens, defineCard, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Endless Ranks of the Dead',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        // ruling 2: contado na resolução (CR 608.2h); ruling 1: com menos de dois Zombies, nenhuma ficha
        const x = Math.floor(controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Zombie')).length / 2);
        yield* createTokens(c.g, c.you, 'Zombie 2/2', x);
      }, { text: 'No início da sua manutenção, crie X fichas de criatura Zombie preta 2/2, onde X é metade do número de Zombies que você controla, arredondado para baixo.' }),
    ],
  }],
  rulings: {
    1: 'teste: com um só Zombie, nenhuma ficha',
    2: 'teste: dois Endless Ranks: as fichas do primeiro contam para o segundo',
  },
});
