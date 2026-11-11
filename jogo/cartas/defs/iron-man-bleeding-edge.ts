// Iron Man, Bleeding Edge
// Flying
// Whenever you cast an artifact spell, you may copy it, except the copy isn't legendary. Do this only once each turn.
import { copySpell, defineCard, is, keyword, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'Iron Man, Bleeding Edge:copiou';

export default defineCard({
  name: 'Iron Man, Bleeding Edge',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.youCast(is.artifact), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // "faça isso só uma vez por turno": conta quando a cópia é de fato feita
        if (eu && eu.usedThisTurn[CHAVE] === s.turn.number) return;
        const magica = c.event.spell as ObjId;
        if (!(yield* yesNo(c.g, c.you, `Iron Man: copiar ${nameOf(c.g, magica)}? (só uma vez por turno)`))) return;
        if (eu) eu.usedThisTurn[CHAVE] = s.turn.number;
        const copia = yield* copySpell(c.g, magica, c.you, { newTargets: true });
        // CR 707.9b: "exceto que a cópia não é lendária"; vira ficha ao resolver (CR 608.3f)
        if (copia !== null && s.objects[copia]) {
          const o = s.objects[copia];
          o.copyOf = { def: o.copyOf?.def ?? o.def, face: o.copyOf?.face ?? o.face ?? 0, except: { ...(o.copyOf?.except ?? {}), legendary: false } };
          c.g.bump();
        }
      }, { text: 'Sempre que você conjura uma mágica de artefato, você pode copiá-la, exceto que a cópia não é lendária. Faça isso só uma vez por turno.' }),
    ],
  }],
  rulings: {},
});
