// Channeler Initiate
// When this creature enters, put three -1/-1 counters on target creature you control.
// {T}, Remove a -1/-1 counter from this creature: Add one mana of any color.
import { addCounters, defineCard, etb, is, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Channeler Initiate',
  faces: [{
    abilities: [
      etb(function* (c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 3, c.you); },
        { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Quando esta criatura entra, coloque três marcadores -1/-1 na criatura alvo que você controla.' }),
      mana('any', { cost: '{T}, Remove a -1/-1 counter from this creature', text: '{T}, Remova um marcador -1/-1 desta criatura: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});
