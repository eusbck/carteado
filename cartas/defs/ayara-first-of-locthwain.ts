// Ayara, First of Locthwain
// Whenever Ayara or another black creature you control enters, each opponent loses 1 life and you gain 1 life.
// {T}, Sacrifice another black creature: Draw a card.
import { activated, chars, controllerOf, defineCard, draw, gainLife, isCreature, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ayara, First of Locthwain',
  faces: [{
    abilities: [
      // "Ayara ou outra criatura preta que você controla": a própria Ayara dispara mesmo que deixe de ser preta
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj]
        && (e.obj === c.source || (isCreature(c.g, e.obj) && chars(c.g, e.obj).colors.includes('B') && controllerOf(c.g, e.obj) === c.you))), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source); // só 1, não 1 por oponente
      }, { text: 'Sempre que Ayara ou outra criatura preta que você controla entra, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
      activated([
        { k: 'tap' },
        { k: 'sacrifice', n: 1, label: 'outra criatura preta', filter: (c, id) => id !== c.source && isCreature(c.g, id) && chars(c.g, id).colors.includes('B') },
      ], function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{T}, Sacrifique outra criatura preta: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: não há Gigante de Duas Cabeças (o análogo multijogador está no teste: no multijogador: ao entrar, cada oponente perde 1 e você ganha só 1)',
  },
});
