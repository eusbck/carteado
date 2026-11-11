// Hugh, First of Many
// Artifact spells you cast have replicate {2}{U}. (Whenever you cast an artifact spell, copy it for each time you paid
// its replicate cost. Each copy becomes a token.)
import { copySpell, defineCard, is, on, staticAbility, timesPaid, triggered } from '../../motor/api.ts';
import type { AdditionalCostDef } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

// o replicar concedido é pago à parte do replicar que a mágica já tiver (CR 702.56b)
const CHAVE = 'replicar:hugh';
const REPLICAR: AdditionalCostDef = { key: CHAVE, label: 'replicar {2}{U} (Hugh)', parts: [{ k: 'mana', cost: '{2}{U}' }], optional: true, repeatable: true };

export default defineCard({
  name: 'Hugh, First of Many',
  faces: [{
    abilities: [
      staticAbility({
        rules: { grantedAdditionalCosts: (c, p, magica) => (p === c.you && is.artifact(c, magica) ? [REPLICAR] : null) },
        text: 'As mágicas de artefato que você conjura têm replicar {2}{U}.',
      }),
      triggered(on.youCast((c, id) => timesPaid(c.g, id, CHAVE) > 0), function* (c) {
        const magica = c.event.spell as ObjId;
        const n = timesPaid(c.g, magica, CHAVE);
        for (let i = 0; i < n; i++) yield* copySpell(c.g, magica, c.you, { newTargets: true, semExtra: i > 0 });
      }, { text: 'Replicar {2}{U}: quando você conjura a mágica de artefato, copie-a para cada vez que pagou o custo de replicar.' }),
    ],
  }],
  rulings: {},
});
