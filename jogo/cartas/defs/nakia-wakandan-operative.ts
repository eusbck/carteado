// Nakia, Wakandan Operative
// Reach
// Whenever your commander enters, you become the monarch.
// {2}, {T}: Put two +1/+1 counters on target creature or Vehicle. Activate only as a sorcery.
import { activated, addCounters, becomeMonarch, defineCard, is, keyword, on, or, t, tgt, triggered } from '../../motor/api.ts';
import { ehComandanteDe } from '../wakanda.ts';

export default defineCard({
  name: 'Nakia, Wakandan Operative',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.enters((c, id) => ehComandanteDe(c.g, id, c.you)), function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Sempre que o seu comandante entra, você se torna o monarca.' }),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, { timing: 'sorcery', targets: [t.permanent(or(is.creature, is.subtype('Vehicle')), 'criatura ou Vehicle alvo')], text: '{2}, {T}: Coloque dois marcadores +1/+1 na criatura ou Vehicle alvo. Ative somente como feitiço.' }),
    ],
  }],
  rulings: {},
});