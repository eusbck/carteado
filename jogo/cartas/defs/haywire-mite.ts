// Haywire Mite
// When this creature dies, you gain 2 life.
// {G}, Sacrifice this creature: Exile target noncreature artifact or noncreature enchantment.
import { activated, and, defineCard, exile, gainLife, is, not, on, or, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Haywire Mite',
  faces: [{
    abilities: [
      triggered(on.selfDies(), function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: 'Quando esta criatura morre, você ganha 2 de vida.' }),
      activated('{G}, Sacrifice this creature', function* (c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); }, {
        targets: [t.permanent(and(not(is.creature), or(is.artifact, is.enchantment)), 'artefato não criatura ou encantamento não criatura alvo')],
        text: '{G}, Sacrifique esta criatura: Exile o artefato não criatura ou encantamento não criatura alvo.',
      }),
    ],
  }],
  rulings: {},
});
