// Hugh, First of Many
// Artifact spells you cast have replicate {2}{U}. (Whenever you cast an artifact spell, copy it for each time you paid
// its replicate cost. Each copy becomes a token.)
import { copySpell, defineCard, is, on, replicate, staticAbility, timesPaid, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// CR 702.56b: o replicar concedido por Hugh é pago à parte de qualquer outro replicar da mágica
const CHAVE = 'replicar:hugh';
const REPLICAR = { ...replicate('{2}{U}').cost, key: CHAVE };

export default defineCard({
  name: 'Hugh, First of Many',
  faces: [{
    abilities: [
      // CR 702.56a, primeira parte: o custo adicional opcional e repetível, só nas mágicas de artefato
      staticAbility({
        rules: { grantedAdditionalCosts: (c, p, magica) => (p === c.you && is.artifact(c, magica) ? [REPLICAR] : null) },
        text: 'As mágicas de artefato que você conjura têm replicar {2}{U}.',
      }),
      // segunda parte: quando você conjura a mágica, copie-a para cada vez que o replicar foi pago; a cópia de uma
      // mágica de permanente vira ficha ao resolver (CR 608.3f)
      triggered(on.youCast((c, id) => timesPaid(c.g, id, CHAVE) > 0), function* (c) {
        const magica = c.event.spell as ObjId;
        const n = timesPaid(c.g, magica, CHAVE);
        for (let i = 0; i < n; i++) yield* copySpell(c.g, magica, c.you, { newTargets: true, semExtra: i > 0 });
      }, { text: 'Replicar {2}{U}: quando você conjura essa mágica, copie-a para cada vez que pagou o custo de replicar. Cada cópia vira uma ficha.' }),
    ],
  }],
  rulings: {},
});
