// Black Market
// Whenever a creature dies, put a charge counter on this enchantment.
// At the beginning of your first main phase, add {B} for each charge counter on this enchantment.
import { addCounters, addMana, defineCard, on, triggered } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Black Market',
  faces: [{
    abilities: [
      triggered(on.dies(() => true), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { text: 'Sempre que uma criatura morre, coloque um marcador de carga neste encantamento.' }),
      triggered(on.firstMain(), function* (c) {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        if (n > 0) addMana(c.g, c.you, Array<ManaType>(n).fill('B'), { source: c.source });
      }, { text: 'No início da sua primeira fase principal, adicione {B} para cada marcador de carga neste encantamento.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 106.4 — a mana some ao fim da fase se não for usada' },
});
