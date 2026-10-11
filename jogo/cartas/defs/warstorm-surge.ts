// Warstorm Surge
// Whenever a creature you control enters, it deals damage equal to its power to any target.
import { and, dealDamage, defineCard, is, lkiChars, on, t, tgtRef, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Warstorm Surge',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.creature, is.yours)), function* (c) {
        const criatura = c.event.obj as ObjId;
        const alvo = tgtRef(c);
        // ruling 2 / CR 608.2h: a força atual na resolução, ou a última conhecida se saiu do campo
        const forca = lkiChars(c.g, criatura)?.power ?? 0;
        // ruling 1: a criatura é a fonte do dano (toque mortífero, vínculo com a vida etc. contam)
        if (alvo && forca > 0) dealDamage(c.g, [{ source: criatura, target: alvo, amount: forca, combat: false }]);
      }, {
        // ruling 1: a fonte da habilidade (para mirar) é Warstorm Surge — proteção contra vermelho impede o alvo
        targets: [t.any()],
        text: 'Sempre que uma criatura que você controla entra, ela causa dano igual à força dela a qualquer alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura é a fonte do dano: vínculo com a vida conta mesmo fora do campo',
    2: 'teste: fora do campo, usa a última força conhecida',
  },
});
