// Methods of the Mighty
// Choose one or more —
// • Destroy target artifact.
// • Destroy target tapped creature.
// • Put a +1/+1 counter on each creature you control.
import { addCounters, creaturesOf, defineCard, destroy, is, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Methods of the Mighty',
  faces: [{
    spell: {
      modes: modal(1, 3, [
        { text: 'Destrua o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        { text: 'Destrua a criatura virada alvo', targets: [t.creature(is.tapped, 'criatura virada alvo')], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        { text: 'Coloque um marcador +1/+1 em cada criatura que você controla', *effect(c) { for (const id of creaturesOf(c.g, c.you)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you); } },
      ]),
    },
  }],
  rulings: {},
});