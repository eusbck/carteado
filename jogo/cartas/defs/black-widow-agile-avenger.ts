// Black Widow, Agile Avenger
// Menace
// Whenever an opponent draws their second card each turn, put a +1/+1 counter on Black Widow and you draw a card.
import { addCounters, defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Black Widow, Agile Avenger',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player].cardsDrawn === 2), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente compra a segunda carta dele em cada turno, coloque um marcador +1/+1 em Black Widow e você compra uma carta.' }),
    ],
  }],
  rulings: {},
});