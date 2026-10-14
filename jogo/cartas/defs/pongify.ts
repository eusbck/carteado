// Pongify
// Destroy target creature. It can't be regenerated. Its controller creates a 3/3 green Ape creature token.
import { controllerOf, createTokens, defineCard, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Pongify',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = controllerOf(c.g, id);
        // CR 701.19c: não pode ser regenerada; ruling 1: mesmo que não seja destruída, o controlador cria o Ape
        yield* destroy(c.g, [id], { cantRegenerate: true });
        yield* createTokens(c.g, dono, 'Ape', 1);
      },
    },
  }],
  rulings: {
    1: 'teste: destrói a criatura e o controlador dela cria um Ape 3/3; indestrutível, não morre mas o Ape vem',
  },
});
