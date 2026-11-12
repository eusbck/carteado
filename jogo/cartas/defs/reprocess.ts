// Reprocess
// Sacrifice any number of artifacts, creatures, and/or lands. Draw a card for each permanent sacrificed this way.
import { defineCard, draw, isCreature, isLand, isType } from '../../motor/api.ts';
import { sacrificaTerrenos } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Reprocess',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: pode sacrificar zero
        const n = yield* sacrificaTerrenos(c, 'Reprocess: sacrifique quantos artefatos, criaturas e/ou terrenos quiser',
          (id) => isType(c.g, id, 'Artifact') || isCreature(c.g, id) || isLand(c.g, id));
        if (n > 0) yield* draw(c.g, c.you, n);
      },
    },
  }],
  rulings: { 1: 'teste: sem sacrificar nada, não compra' },
});
