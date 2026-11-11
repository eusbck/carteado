// Balance of Terror
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Destroy up to one other target artifact or enchantment.
// II, III — Exile up to one other target permanent you control. Return that card to the battlefield under its
// owner's control at the beginning of the next end step.
import { chapter, defineCard, destroy, is, or, sagaEnters, t, tgt, upTo } from '../../motor/api.ts';
import { exilaAteAProximaEtapaFinal } from '../startrek.ts';

export default defineCard({
  name: 'Balance of Terror',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [upTo(1, t.permanent((c, id) => id !== c.source && or(is.artifact, is.enchantment)(c, id), 'outro artefato ou encantamento alvo'))],
        text: 'I — Destrua até um outro artefato ou encantamento alvo.',
      }),
      // CR 714.2b: os capítulos II e III são a mesma habilidade, que dispara em cada um
      chapter([2, 3], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exilaAteAProximaEtapaFinal(c, [id]);
      }, {
        targets: [upTo(1, t.permanent((c, id) => id !== c.source && is.yours(c, id), 'outra permanente alvo que você controla'))],
        text: 'II, III — Exile até uma outra permanente alvo que você controla. Devolva essa carta ao campo sob o controle do dono no início da próxima etapa final.',
      }),
    ],
  }],
  rulings: {},
});
