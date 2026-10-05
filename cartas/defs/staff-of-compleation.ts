// Staff of Compleation
// {T}, Pay 1 life: Destroy target permanent you own.
// {T}, Pay 2 life: Add one mana of any color.
// {T}, Pay 3 life: Proliferate.
// {T}, Pay 4 life: Draw a card.
// {5}: Untap this artifact.
import { activated, defineCard, destroy, draw, mana, proliferate, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Staff of Compleation',
  faces: [{
    abilities: [
      activated('{T}, Pay 1 life', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.permanent((c, id) => c.g.state.objects[id].owner === c.you, 'permanente alvo do qual você é dono')], text: '{T}, Pague 1 de vida: Destrua o permanente alvo do qual você é dono.' }),
      mana('any', { cost: '{T}, Pay 2 life', text: '{T}, Pague 2 de vida: Adicione uma mana de qualquer cor.' }),
      activated('{T}, Pay 3 life', function* (c) { yield* proliferate(c.g, c.you); }, { text: '{T}, Pague 3 de vida: Prolifere.' }),
      activated('{T}, Pay 4 life', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{T}, Pague 4 de vida: Compre uma carta.' }),
      activated('{5}', function* (c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source); }, { text: '{5}: Desvire este artefato.' }),
    ],
  }],
});
