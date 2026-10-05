// Gristle Glutton
// {T}, Blight 1: Discard a card. If you do, draw a card. (To blight 1, put a -1/-1 counter on a creature you control.)
import { activated, defineCard, discard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Gristle Glutton',
  faces: [{
    abilities: [
      // rulings 1-6: blight (CR 701.68) é custo; sem criatura, não pode ativar
      activated('{T}, Blight 1', function* (c) {
        const d = yield* discard(c.g, c.you, 1);
        if (d.length) yield* draw(c.g, c.you, 1);
      }, { text: '{T}, Blight 1: Descarte uma carta. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a — olha para trás com todos os marcadores',
    2: 'teste: pode fazer blight na própria criatura 1/3 até morrer',
    3: 'regra geral: CR 701.68a — todos os marcadores numa só criatura',
    4: 'regra geral: CR 601.2 — ninguém age durante o pagamento',
    5: 'regra geral: CR 701.68b — sem criatura, não pode fazer blight',
    6: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam',
  },
});
