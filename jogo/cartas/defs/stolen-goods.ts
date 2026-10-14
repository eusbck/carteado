// Stolen Goods
// Target opponent exiles cards from the top of their library until they exile a nonland card. Until end of turn, you
// may cast that card without paying its mana cost.
import { allowPlay, defineCard, exile, isLand, t, tgtPlayer } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Stolen Goods',
  faces: [{
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const g = c.g;
        const p = tgtPlayer(c);
        if (p === null) return;
        const lib = g.state.zones.library[p];
        const i = lib.findIndex((id) => !isLand(g, id));
        // ruling 6: sem carta que não seja terreno, exila o grimório inteiro
        const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        if (!tiradas.length) return;
        const res = yield* exile(g, tiradas);
        const achada = i < 0 ? null : res[res.length - 1];
        if (achada === null || achada === undefined || g.state.objects[achada]?.zone !== 'exile') return;
        // ruling 3: no tempo normal da carta; rulings 4-5: sem custo alternativo, X = 0
        allowPlay(g, c.you, c.source, [achada as ObjId], { kind: 'endOfTurn' }, { free: true, spellsOnly: true });
      },
    },
  }],
  rulings: {
    1: 'teste: exila até achar uma carta que não é terreno; você a conjura de graça; os terrenos ficam exilados',
    2: 'regra geral: CR 117.1 — se não conjurar (ou não puder), a carta fica exilada',
    3: ROUBO.tempo,
    4: ROUBO.gratisAlternativo,
    5: ROUBO.gratisX,
    6: 'teste: sem carta que não seja terreno, o grimório inteiro é exilado',
  },
});
