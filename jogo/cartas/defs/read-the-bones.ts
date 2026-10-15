// Read the Bones
// Scry 2, then draw two cards. You lose 2 life. (To scry 2, look at the top two cards of your library, then put any
// number of them on the bottom and the rest on top in any order.)
import { defineCard, draw, lookAndArrange, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Read the Bones',
  faces: [{
    spell: {
      *effect(c) {
        yield* lookAndArrange(c.g, c.you, 2, 'scry');
        yield* draw(c.g, c.you, 2);
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: {
    1: 'teste: vidência 2, compra duas cartas e perde 2 de vida na resolução',
    2: 'regra geral: CR 701.22a — a vidência põe cada carta no topo ou no fundo (motor/actions.ts lookAndArrange)',
    3: 'regra geral: CR 701.22a — a ordem do topo e do fundo é escolhida (motor/actions.ts lookAndArrange)',
    4: 'teste: vidência 2, compra duas cartas e perde 2 de vida na resolução',
    5: 'não se aplica: Read the Bones não tem alvos',
  },
});
