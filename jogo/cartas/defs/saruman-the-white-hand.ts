// Saruman, the White Hand
// Whenever you cast a noncreature spell, amass Orcs X, where X is that spell's mana value. (Put X +1/+1 counters on an Army
// you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)
// Goblins and Orcs you control have ward {2}.
import { amass, and, anthem, defineCard, is, lkiChars, not, on, or, triggered, wardGranted } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Saruman, the White Hand',
  faces: [{
    abilities: [
      // ruling 1: o valor de mana inclui o X escolhido; ruling 2: reúne mesmo que a mágica já tenha saído da pilha
      triggered(on.youCast(not(is.creature)), function* (c) {
        const x = lkiChars(c.g, c.event.spell as ObjId)?.manaValue ?? 0;
        if (x > 0) yield* amass(c.g, c.you, 'Orc', x);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, reúna Orcs X, onde X é o valor de mana dessa mágica.' }),
      // CR 702.21a: resguardo {2} concedido (palavra-chave e gatilho)
      anthem(and(or(is.subtype('Goblin'), is.subtype('Orc')), is.yours), () => [{ k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') }], 'Os Goblins e Orcs que você controla têm resguardo {2}.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — o valor de mana da mágica na pilha inclui o X escolhido (motor/chars.ts)',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica, mesmo que ela seja anulada (lê a última informação)',
    3: REUNIR.escrita,
    4: REUNIR.como,
    5: REUNIR.zumbis,
    6: REUNIR.varios,
    7: REUNIR.entra00,
    8: REUNIR.alvos,
    9: REUNIR.reunido,
  },
});
