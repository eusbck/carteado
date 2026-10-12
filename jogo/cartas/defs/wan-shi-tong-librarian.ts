// Wan Shi Tong, Librarian
// Flash
// Flying, vigilance
// When Wan Shi Tong enters, put X +1/+1 counters on him. Then draw half X cards, rounded down.
// Whenever an opponent searches their library, put a +1/+1 counter on Wan Shi Tong and draw a card.
import { addCounters, defineCard, draw, etb, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Wan Shi Tong, Librarian',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying', 'vigilance'),
      etb(function* (c) {
        // X é o da mágica que virou esta permanente; sem ter sido conjurada, X é 0
        const x = Number((c.g.state.objects[c.source]?.data.spell as { x?: number } | undefined)?.x ?? 0);
        if (x > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', x, c.you);
        const n = Math.floor(x / 2);
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando Wan Shi Tong entra, coloque X marcadores +1/+1 nele. Depois, compre metade de X cartas, arredondada para baixo.' }),
      // ruling 1: só quando um oponente procura no próprio grimório; ruling 2: vai para a pilha depois da busca
      triggered(on.custom((e, c) => e.type === 'search' && c.g.isOpponent(c.you, e.player) && e.library === e.player), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente procura no grimório dele, coloque um marcador +1/+1 em Wan Shi Tong e compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara quando um oponente procura no próprio grimório; você procurando, não',
    2: 'regra geral: CR 603.3 — o gatilho só vai para a pilha depois que a mágica ou habilidade da busca termina de resolver (motor/triggers.ts)',
  },
});