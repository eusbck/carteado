// Verdant Sun's Avatar
// Whenever this creature or another creature you control enters, you gain life equal to that creature's toughness.
import { controllerOf, defineCard, gainLife, isCreature, lkiChars, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: "Verdant Sun's Avatar",
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { criatura: e.obj } : false)), function* (c) {
        // ruling 1: a resistência é vista na resolução (a última conhecida, se já saiu); negativa não muda a vida
        const r = lkiChars(c.g, c.event.criatura as ObjId)?.toughness ?? 0;
        if (r > 0) gainLife(c.g, c.you, r, c.source);
      }, { text: 'Sempre que esta criatura ou outra criatura que você controla entra, você ganha vida igual à resistência dessa criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: a resistência é vista na resolução, também a da própria Avatar',
  },
});
