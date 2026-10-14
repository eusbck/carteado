// Search the Premises
// Whenever a creature attacks you or a planeswalker you control, investigate. (Create a Clue token. It's an artifact
// with "{2}, Sacrifice this token: Draw a card.")
import { controllerOf, defineCard, investigate, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Search the Premises',
  faces: [{
    abilities: [
      // um gatilho por criatura atacante que ataca você ou um planeswalker seu
      triggered(on.custom((e, c) => (e.type === 'attackers'
        ? e.attackers.filter((a) => (a.target.kind === 'player' ? a.target.id === c.you : !!c.g.state.objects[a.target.id] && controllerOf(c.g, a.target.id) === c.you)).map((a) => ({ atacante: a.obj }))
        : false)), function* (c) {
        yield* investigate(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura ataca você ou um planeswalker que você controla, investigue.' }),
    ],
  }],
  rulings: {},
});
