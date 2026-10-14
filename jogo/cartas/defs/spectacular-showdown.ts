// Spectacular Showdown
// Put a double strike counter on target creature, then goad each creature that had a double strike counter put on it
// this way. (Until your next turn, those creatures attack each combat if able and attack a player other than you if
// able.)
// Overload {4}{R}{R}{R} (You may cast this spell for its overload cost. If you do, change "target" in its text to "each.")
import { addCounters, allCreatures, defineCard, goad, overload, overloaded, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Spectacular Showdown',
  faces: [{
    altCosts: [overload('{4}{R}{R}{R}')],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const alvo = tgt(c);
        const ids = overloaded(c) ? allCreatures(c.g) : alvo !== null ? [alvo] : [];
        // os marcadores primeiro; depois goada as que receberam o marcador
        const receberam = ids.filter((id) => addCounters(c.g, { kind: 'obj', id }, 'double strike', 1, c.you) > 0);
        for (const id of receberam) goad(c.g, id, c.you);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9a — conjurada sem pagar o custo de mana, não se pode pagar a sobrecarga',
    2: 'teste: sobrecarga: um marcador de golpe duplo em cada criatura, todas goadadas, sem alvo',
    3: 'teste: sem sobrecarga: marcador de golpe duplo e goad na criatura alvo',
    4: 'regra geral: CR 601.2f — custo total: o da sobrecarga mais aumentos, menos reduções; o valor de mana não muda',
  },
});
