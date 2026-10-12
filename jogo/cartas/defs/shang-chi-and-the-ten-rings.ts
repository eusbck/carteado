// Shang-Chi and the Ten Rings
// First strike
// Whenever you draw a card, put a +1/+1 counter on Shang-Chi.
// When the tenth +1/+1 counter is put on Shang-Chi, you draw five cards and gain 5 life.
import { addCounters, defineCard, draw, gainLife, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Shang-Chi and the Ten Rings',
  faces: [{
    abilities: [
      keyword('first strike'),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você compra uma carta, coloque um marcador +1/+1 em Shang-Chi.' }),
      // dispara quando a leva de marcadores faz o total passar de nove ou menos para dez ou mais
      triggered(on.custom((e, c) => {
        if (e.type !== 'counters' || e.kind !== '+1/+1' || e.target.kind !== 'obj' || e.target.id !== c.source) return false;
        const agora = c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0;
        return agora >= 10 && agora - e.amount < 10;
      }), function* (c) {
        yield* draw(c.g, c.you, 5);
        gainLife(c.g, c.you, 5, c.source);
      }, { text: 'Quando o décimo marcador +1/+1 é colocado em Shang-Chi, você compra cinco cartas e ganha 5 pontos de vida.' }),
    ],
  }],
  rulings: {},
});