// Epic Experiment
// Exile the top X cards of your library. You may cast instant and sorcery spells with mana value X or less from among
// them without paying their mana costs. Then put all cards exiled this way that weren't cast into your graveyard.
import { defineCard, exile, is, manaValue, moveObjects } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { conjuraDentreGratis } from '../roubo.ts';

export default defineCard({
  name: 'Epic Experiment',
  faces: [{
    spell: {
      *effect(c) {
        const x = c.x;
        if (x <= 0) return;
        const topo = c.g.state.zones.library[c.you].slice(0, x);
        const exiladas = (yield* exile(c.g, topo)).filter((id): id is ObjId => id !== null && id !== undefined && c.g.state.objects[id]?.zone === 'exile');
        // rulings 3-4: uma de cada vez, na ordem escolhida, ignorando o tempo do tipo da carta
        yield* conjuraDentreGratis(c, exiladas, {
          rotulo: 'Epic Experiment', varias: true,
          filtro: (id) => is.instantOrSorcery(c, id) && manaValue(c.g, id) <= x,
        });
        // ruling 5: as que não foram conjuradas vão para o cemitério
        const sobram = exiladas.filter((id) => c.g.state.objects[id]?.zone === 'exile');
        if (sobram.length) yield* moveObjects(c.g, sobram.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
    2: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    3: 'teste: conjura de graça as instantâneas e feitiços com valor de mana X ou menos, e o resto vai para o cemitério',
    4: 'regra geral: CR 608.2g — conjuradas durante a resolução, ignoram o tempo do tipo (motor/stack.ts castSpell)',
    5: 'teste: conjura de graça as instantâneas e feitiços com valor de mana X ou menos, e o resto vai para o cemitério',
  },
});
