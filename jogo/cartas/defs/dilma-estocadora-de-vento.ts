// Dilma, Estocadora de Vento (carta própria da mesa)
// Whenever you cast an enchantment spell, put a wind counter on Dilma.
// Remove three wind counters from Dilma: Draw two cards. Each opponent discards a card.
import { activated, addCounters, defineCard, discard, draw, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Dilma, Estocadora de Vento',
  faces: [{
    abilities: [
      triggered(on.youCast(is.enchantment), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'wind', 1, c.you);
      }, { text: 'Sempre que você conjura uma mágica de encantamento, coloque um marcador de vento em Dilma.' }),
      activated('Remove three wind counters from this creature', function* (c) {
        yield* draw(c.g, c.you, 2);
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) yield* discard(c.g, p, 1);
      }, { text: 'Remova três marcadores de vento de Dilma: Compre duas cartas. Cada oponente descarta uma carta.' }),
    ],
  }],
  rulings: {},
});
