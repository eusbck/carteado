// Teleportation Circle
// At the beginning of your end step, exile up to one target artifact or creature you control, then return that card to the battlefield under its owner's control.
import { and, defineCard, is, on, or, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { piscar } from '../borg.ts';

export default defineCard({
  name: "Teleportation Circle",
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'dono'); }, {
        targets: [upTo(1, t.permanent(and(is.yours, or(is.artifact, is.creature)), 'até um artefato ou criatura alvo que você controla'))],
        text: 'No início da sua etapa final, exile até um artefato ou criatura alvo que você controla e devolva essa carta ao campo de batalha.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — ficha exilada não volta (motor/sba.ts)',
  },
});
