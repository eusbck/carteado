// Steelbane Hydra
// This creature enters with X +1/+1 counters on it.
// {2}{G}, Remove a +1/+1 counter from this creature: Destroy target artifact or enchantment.
import { activated, defineCard, destroy, entersWithCounters, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Steelbane Hydra',
  faces: [{
    abilities: [
      entersWithCounters('+1/+1', (_c, ev) => Number(ev.spell?.x ?? 0)),
      activated('{2}{G}, Remove a +1/+1 counter from this creature', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')], text: '{2}{G}, Remova um marcador +1/+1 desta criatura: Destrua o artefato ou encantamento alvo.' }),
    ],
  }],
  rulings: {},
});