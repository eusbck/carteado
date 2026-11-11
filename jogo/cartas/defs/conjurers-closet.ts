// Conjurer's Closet
// At the beginning of your end step, you may exile target creature you control, then return that card to the battlefield under your control.
import { and, defineCard, is, on, or, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { piscar } from '../borg.ts';

export default defineCard({
  name: "Conjurer's Closet",
  faces: [{
    abilities: [
      triggered(on.endStep('you'), function* (c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'voce'); }, {
        targets: [upTo(1, t.creature(is.yours, 'criatura alvo que você controla'))],
        text: 'No início da sua etapa final, você pode exilar a criatura alvo que você controla e devolver essa carta ao campo de batalha.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo; Auras vão para o cemitério (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — ficha exilada não volta (motor/sba.ts)',
    3: 'regra geral: CR 611.2b — você controla a criatura emprestada até o fim do turno, inclusive na etapa final',
    4: 'teste: exila e devolve sob o seu controle na sua etapa final',
  },
});
