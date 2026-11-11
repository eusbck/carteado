// Chief Kyle, Transporter Tech
// Landfall — Whenever a land you control enters, exile up to one other target creature you control. Return that card
// to the battlefield under its owner's control at the beginning of the next end step.
import { defineCard, is, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { exilaAteAProximaEtapaFinal } from '../startrek.ts';

export default defineCard({
  name: 'Chief Kyle, Transporter Tech',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exilaAteAProximaEtapaFinal(c, [id]);
      }, {
        targets: [upTo(1, t.creature((c, id) => id !== c.source && is.yours(c, id), 'outra criatura alvo que você controla'))],
        text: 'Aterragem — Sempre que um terreno que você controla entra, exile até uma outra criatura alvo que você controla. Devolva essa carta ao campo sob o controle do dono no início da próxima etapa final.',
      }),
    ],
  }],
  rulings: {},
});
