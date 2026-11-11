// Essence Flux
// Exile target creature you control, then return that card to the battlefield under its owner's control. If it's a
// Spirit, put a +1/+1 counter on it.
import { addCounters, chars, defineCard, is, t, tgt } from '../../motor/api.ts';
import { piscar } from '../borg.ts';

export default defineCard({
  name: 'Essence Flux',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const novo = yield* piscar(c, id, 'dono');
        if (novo !== null && chars(c.g, novo).subtypes.includes('Spirit')) addCounters(c.g, { kind: 'obj', id: novo }, '+1/+1', 1, c.you);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo (motor/actions.ts)',
    2: 'regra geral: CR 111.7 — ficha exilada não volta (motor/sba.ts)',
    3: 'teste: volta sob o controle do dono; um Spirit ganha um marcador +1/+1',
    4: 'regra geral: CR 205.3 — confere se é Spirit já no campo (cartas/defs/essence-flux.ts)',
  },
});
