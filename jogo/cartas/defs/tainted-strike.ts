// Tainted Strike
// Target creature gets +1/+0 and gains infect until end of turn. (It deals damage to creatures in the form of -1/-1
// counters and to players in the form of poison counters.)
import { defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { INFECTAR } from '../jin.ts';

export default defineCard({
  name: 'Tainted Strike',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 1, t: 0 }, { k: 'addKeyword', kw: 'infect' }]); },
    },
  }],
  rulings: {
    1: INFECTAR.veneno,
    2: INFECTAR.qualquer,
    3: INFECTAR.ficam,
    4: INFECTAR.eDano,
    5: INFECTAR.prevenido,
    6: INFECTAR.planeswalker,
  },
});