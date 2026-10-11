// Minamo, School at Water's Edge
// {T}: Add {U}.
// {U}, {T}: Untap target legendary permanent.
import { activated, defineCard, is, mana, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: "Minamo, School at Water's Edge",
  faces: [{
    abilities: [
      mana('U'),
      activated('{U}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
      }, { targets: [t.permanent(is.legendary, 'permanente lendária alvo')], text: '{U}, {T}: Desvire a permanente lendária alvo.' }),
    ],
  }],
  rulings: {},
});
