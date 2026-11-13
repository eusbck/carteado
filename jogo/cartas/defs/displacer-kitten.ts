// Displacer Kitten
// Avoidance — Whenever you cast a noncreature spell, exile up to one target nonland permanent you control, then return
// that card to the battlefield under its owner's control.
import { defineCard, is, not, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { piscar } from '../piscar.ts';

export default defineCard({
  name: 'Displacer Kitten',
  faces: [{
    abilities: [
      triggered(on.youCast(not(is.creature)), function* (c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'dono'); }, {
        targets: [upTo(1, t.nonlandPermanent(is.yours, 'até um permanente não terreno alvo que você controla'))],
        text: 'Evasão — Sempre que você conjura uma mágica que não seja de criatura, exile até um permanente não terreno alvo que você controla e depois devolva essa carta ao campo de batalha sob o controle do dono.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3 — a habilidade resolve antes da mágica que a fez disparar',
    2: 'regra geral: CR 400.7 — volta como objeto novo (motor/actions.ts)',
  },
});
