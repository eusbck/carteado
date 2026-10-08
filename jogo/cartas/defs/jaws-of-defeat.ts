// Jaws of Defeat
// Whenever a creature you control enters, target opponent loses life equal to the difference between that creature's
// power and its toughness.
import { and, defineCard, is, lkiChars, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Jaws of Defeat',
  faces: [{
    abilities: [triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.creature, is.yours)(c, e.obj) ? { creature: e.obj } : false), function* (c) {
      const p = tgtPlayer(c);
      const ch = lkiChars(c.g, c.event.creature as ObjId);
      if (p === null || !ch) return;
      // ruling 1: a diferença é sempre positiva
      loseLife(c.g, p, Math.abs((ch.power ?? 0) - (ch.toughness ?? 0)), c.source);
    }, { targets: [t.opponent()], text: 'Sempre que uma criatura que você controla entra, o oponente alvo perde vida igual à diferença entre a força e a resistência dessa criatura.' })],
  }],
  rulings: { 1: 'teste: a diferença é a maior menos a menor' },
});
