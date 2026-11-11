// Fatestitcher
// {T}: You may tap or untap another target permanent.
// Unearth {U} ({U}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning
// of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { activated, chooseItems, defineCard, nameOf, t, tap, tgt, unearth, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Fatestitcher',
  faces: [{
    abilities: [
      activated('{T}', function* (c) {
        const g = c.g;
        const id = tgt(c);
        if (id === null) return;
        const o = g.state.objects[id];
        const [esc] = yield* chooseItems(g, c.you, `Fatestitcher: ${nameOf(g, id)}`, [
          { id: 'nada', label: 'Não fazer nada' },
          o.tapped ? { id: 'desvirar', label: `Desvirar ${nameOf(g, id)}` } : { id: 'virar', label: `Virar ${nameOf(g, id)}` },
        ], 1, 1);
        if (esc === 'virar') tap(g, id);
        else if (esc === 'desvirar') untap(g, id);
      }, { targets: [{ ...t.permanent(), filter: (c, r) => r.kind === 'obj' && r.id !== c.source, label: 'outro permanente alvo' }], text: '{T}: Você pode virar ou desvirar outro permanente alvo.' }),
      unearth('{U}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.84a, 608.2b — se a carta sai do cemitério antes, desenterrar não faz nada (motor/mecanicas.ts unearth)',
    2: 'regra geral: CR 702.84a — desenterrar é habilidade ativada, não conjuração (motor/mecanicas.ts unearth)',
    3: 'regra geral: CR 702.84a, 603.7 — o exílio na etapa final é gatilho atrasado (motor/mecanicas.ts unearth)',
    4: 'regra geral: CR 702.84a — o exílio vem do efeito, não de habilidade da criatura (motor/mecanicas.ts unearth)',
    5: 'regra geral: CR 702.84a, 614 — se fosse sair do campo, é exilada em vez disso (motor/mecanicas.ts rule:exileIfLeaves)',
  },
});
