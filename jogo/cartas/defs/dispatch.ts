// Dispatch
// Tap target creature.
// Metalcraft — If you control three or more artifacts, exile that creature.
import { defineCard, exile, t, tap, tgt } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Dispatch',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: vira e depois, com três ou mais artefatos na resolução, exila
        tap(c.g, id);
        if (artefatosDe(c.g, c.you).length >= 3) yield* exile(c.g, [id]);
      },
    },
  }],
  rulings: {
    1: 'teste: com três ou mais artefatos, a criatura é exilada',
  },
});