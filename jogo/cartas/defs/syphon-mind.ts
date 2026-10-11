// Syphon Mind
// Each other player discards a card. You draw a card for each card discarded this way.
import { chooseItems, defineCard, draw, moveObjects, nameOf } from '../../motor/api.ts';
import type { ObjId, ZoneName } from '../../motor/types.ts';

export default defineCard({
  name: 'Syphon Mind',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        // CR 101.4: cada outro jogador escolhe em ordem APNAP; depois todos descartam ao mesmo tempo
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => x !== c.you)) {
          const mao = s.zones.hand[p];
          if (mao.length === 0) continue;
          if (mao.length === 1) { escolhidas.push(mao[0]); continue; }
          const [id] = yield* chooseItems(c.g, p, 'Syphon Mind: descarte uma carta', mao.map((x) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: s.objects[x].def } })), 1, 1);
          escolhidas.push(Number(id));
        }
        // CR 701.9a: descartar = mover da mão para o cemitério do dono
        const descartadas = (yield* moveObjects(c.g, escolhidas.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'discard')).filter((x) => x !== null);
        if (descartadas.length) yield* draw(c.g, c.you, descartadas.length);
      },
    },
  }],
  rulings: {},
});
