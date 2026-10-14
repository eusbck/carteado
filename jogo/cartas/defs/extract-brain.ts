// Extract Brain
// Target opponent chooses X cards from their hand. Look at those cards. You may cast a spell from among them without
// paying its mana cost.
import { chooseItems, defineCard, nameOf, t, tgtPlayer } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { conjuraDentreGratis } from '../roubo.ts';

export default defineCard({
  name: 'Extract Brain',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const g = c.g;
        const p = tgtPlayer(c);
        if (p === null || c.x <= 0) return;
        const mao = g.state.zones.hand[p];
        if (!mao.length) return;
        const n = Math.min(c.x, mao.length);
        // o oponente escolhe as X cartas (todas, se tiver X ou menos)
        const escolhidas: ObjId[] = n === mao.length ? [...mao]
          : (yield* chooseItems(g, p, `Extract Brain: escolha ${n} carta(s) da sua mão para ${g.state.players[c.you].name} olhar`, mao.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), n, n)).map(Number);
        g.log(`${g.state.players[c.you].name} olha ${n} carta(s) da mão de ${g.state.players[p].name}.`);
        yield* conjuraDentreGratis(c, escolhidas, { rotulo: `Extract Brain (mão de ${g.state.players[p].name})`, varias: false });
      },
    },
  }],
  rulings: {},
});
