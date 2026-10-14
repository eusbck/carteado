// Villainous Wealth
// Target opponent exiles the top X cards of their library. You may cast any number of spells with mana value X or less
// from among them without paying their mana costs.
import { defineCard, exile, manaValue, t, tgtPlayer } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { conjuraDentreGratis, ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Villainous Wealth',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const g = c.g;
        const p = tgtPlayer(c);
        if (p === null || c.x <= 0) return;
        const topo = g.state.zones.library[p].slice(0, c.x);
        if (!topo.length) return;
        const exiladas = (yield* exile(g, topo)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        // rulings 1-2: uma de cada vez, durante a resolução, na ordem escolhida
        yield* conjuraDentreGratis(c, exiladas, { rotulo: 'Villainous Wealth', varias: true, filtro: (id) => manaValue(g, id) <= c.x });
      },
    },
  }],
  rulings: {
    1: 'teste: conjura quantas mágicas quiser com valor de mana até X, uma de cada vez, durante a resolução',
    2: ROUBO.durante,
    3: ROUBO.gratisAlternativo,
    4: ROUBO.gratisX,
    5: 'teste: as cartas não conjuradas ficam exiladas',
  },
});
