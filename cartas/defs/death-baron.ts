// Death Baron
// Skeletons you control and other Zombies you control get +1/+1 and have deathtouch. (Any amount of damage they deal
// to a creature is enough to destroy it.)
import { and, anthem, defineCard, is, or } from '../../motor/api.ts';

export default defineCard({
  name: 'Death Baron',
  faces: [{
    abilities: [
      // ruling 1: Skeleton Zombie recebe o bônus uma vez só; ruling 2: não afeta a si mesmo, salvo se virar Skeleton
      anthem(and(is.yours, or(is.subtype('Skeleton'), and(is.subtype('Zombie'), is.other))),
        () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'deathtouch' }],
        'Os Skeletons que você controla e os outros Zombies que você controla recebem +1/+1 e têm toque mortífero.'),
    ],
  }],
  rulings: {
    1: 'teste: Skeleton e Zombie ao mesmo tempo recebe o bônus uma vez só',
    2: 'teste: não afeta a si mesmo, a menos que vire Skeleton',
    3: 'teste: CR 704.5g: dano não letal fica letal quando Death Baron sai do campo',
  },
});
