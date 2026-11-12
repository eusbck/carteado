// Unwind
// Counter target noncreature spell. Untap up to three lands.
import { chooseItems, counter, defineCard, is, isLand, nameOf, not, objItem, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Unwind',
  faces: [{
    spell: {
      targets: [t.spell(not(is.creature), 'mágica não criatura alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* counter(c.g, id);
        // "até três terrenos": quaisquer terrenos virados, de qualquer jogador; escolhidos na resolução, sem alvo
        const s = c.g.state;
        const virados = s.zones.battlefield.filter((x) => s.objects[x].tapped && isLand(c.g, x));
        if (!virados.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Unwind: escolha até três terrenos para desvirar', virados.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, Math.min(3, virados.length));
        for (const x of esc) untap(c.g, Number(x));
      },
    },
  }],
  rulings: {},
});
