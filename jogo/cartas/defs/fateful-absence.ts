// Fateful Absence
// Destroy target creature or planeswalker. Its controller investigates. (They create a Clue token. It's an artifact with
// "{2}, Sacrifice this token: Draw a card.")
import { controllerOf, defineCard, destroy, investigate, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fateful Absence',
  faces: [{
    spell: {
      targets: [t.creatureOrPlaneswalker()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        // o controlador investiga mesmo se a permanente não for destruída (indestrutível)
        if (!c.g.state.players[quem].left) yield* investigate(c.g, quem, 1);
      },
    },
  }],
  rulings: {},
});
