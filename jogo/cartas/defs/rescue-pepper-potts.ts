// Rescue, Pepper Potts
// Flash
// Flying
// When Rescue enters, return up to one other target artifact or creature you control to its owner's hand. If it was an
// artifact, put a +1/+1 counter on Rescue.
import { addCounters, and, defineCard, etb, is, isType, keywords, moveObjects, or, t, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Rescue, Pepper Potts',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      etb(function* (c) {
        const r = c.targets[0]?.[0];
        if (!r || r.kind !== 'obj' || c.g.state.objects[r.id]?.zone !== 'battlefield') return;
        const eraArtefato = isType(c.g, r.id, 'Artifact');
        yield* moveObjects(c.g, [{ id: r.id, to: 'hand' }], 'effect');
        if (eraArtefato && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, {
        targets: [upTo(1, t.permanent(and(is.yours, is.other, or(is.artifact, is.creature)), 'outro artefato ou criatura alvo que você controla'))],
        text: 'Quando Rescue entra, devolva até um outro artefato ou criatura alvo que você controla para a mão do dono. Se era um artefato, coloque um marcador +1/+1 em Rescue.',
      }),
    ],
  }],
  rulings: {},
});