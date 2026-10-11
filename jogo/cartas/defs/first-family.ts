// First Family
// You draw X cards and gain X life, where X is the number of colors among permanents you control and spells you've cast
// this turn.
import { chars, controllerOf, defineCard, draw, gainLife } from '../../motor/api.ts';
import type { Color } from '../../motor/types.ts';

export default defineCard({
  name: 'First Family',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const cores = new Set<Color>();
        for (const id of s.zones.battlefield) if (!s.objects[id].phasedOut && controllerOf(c.g, id) === c.you) for (const cor of chars(c.g, id).colors) cores.add(cor);
        // as mágicas que você conjurou neste turno, inclusive a própria First Family (verde e azul)
        for (const cor of s.turnStats[c.you]?.spellColorsCast ?? []) cores.add(cor);
        const x = cores.size;
        if (x <= 0) return;
        yield* draw(c.g, c.you, x);
        gainLife(c.g, c.you, x, c.source);
      },
    },
  }],
  rulings: {},
});
