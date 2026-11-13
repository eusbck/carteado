// Cloudshift
// Exile target creature you control, then return that card to the battlefield under your control.
import { defineCard, is, t, tgt } from '../../motor/api.ts';
import { piscar } from '../piscar.ts';

export default defineCard({
  name: 'Cloudshift',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'voce'); },
    },
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo: sem marcadores, Auras e efeitos anteriores (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — ficha exilada deixa de existir e não volta (motor/sba.ts)',
    3: 'teste: a criatura volta como objeto novo, sem os marcadores',
    4: 'regra geral: CR 400.7 — se a criatura era de outro dono, volta sob o seu controle mesmo assim (cartas/borg.ts piscar)',
  },
});
