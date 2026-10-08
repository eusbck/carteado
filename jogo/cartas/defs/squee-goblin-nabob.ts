// Squee, Goblin Nabob
// At the beginning of your upkeep, you may return this card from your graveyard to your hand.
import { defineCard, moveObjects, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Squee, Goblin Nabob',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
      if (yield* yesNo(c.g, c.you, 'Squee: devolver do cemitério para a mão?')) yield* moveObjects(c.g, [{ id: c.source, to: 'hand' }], 'effect');
    }, { zones: ['graveyard'], text: 'No início da sua manutenção, você pode devolver esta carta do seu cemitério para a sua mão.' })],
  }],
  rulings: { 1: 'teste: só dispara se estiver no cemitério no início da manutenção' },
});
