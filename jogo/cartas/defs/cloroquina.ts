// Cloroquina (carta própria da mesa)
// Destroy target creature. Its controller gains 3 life. You gain 5 life.
import { controllerOf, defineCard, destroy, gainLife, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Cloroquina',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        // CR 608.2b: sem o alvo, a mágica não resolve e ninguém ganha vida
        if (id === null) return;
        const controlador = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        gainLife(c.g, controlador, 3, c.source);
        gainLife(c.g, c.you, 5, c.source);
      },
    },
  }],
  rulings: {},
});
