// Dogged Detective
// When this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into
// your graveyard and the rest on top of your library in any order.)
// Whenever an opponent draws their second card each turn, you may return this card from your graveyard to your hand.
import { defineCard, etb, lookAndArrange, moveObjects, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Dogged Detective',
  faces: [{
    abilities: [
      // CR 701.25: vigiar 2
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 2, 'surveil'); }, { text: 'Quando esta criatura entra, vigiar 2.' }),
      // ruling 2: basta estar no cemitério quando o oponente compra a segunda carta do turno
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player) && c.g.state.turnStats[e.player].cardsDrawn === 2), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* yesNo(c.g, c.you, 'Dogged Detective: devolver do seu cemitério para a sua mão?')) yield* moveObjects(c.g, [{ id: c.source, to: 'hand' }], 'effect');
      }, { zones: ['graveyard'], text: 'Sempre que um oponente compra a segunda carta dele num turno, você pode devolver esta carta do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.25a — ao vigiar, cada carta vai para o cemitério ou fica no topo, como você quiser (motor/actions.ts lookAndArrange)',
    2: 'teste: no cemitério, quando um oponente compra a segunda carta do turno, pode voltar para a mão',
  },
});
