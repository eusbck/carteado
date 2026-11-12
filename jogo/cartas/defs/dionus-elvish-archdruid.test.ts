import { describe, expect, it } from 'vitest';
import { tap } from '../../motor/actions.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Dionus, Elvish Archdruid';

describe(N, () => {
  it('o próprio Dionus e os Elfos desviram e ganham um marcador ao atacar no seu turno, uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Llanowar Elves', 'Indomitable Ancients'], []] });
    tg.attack([[N, 1], ['Llanowar Elves', 1], ['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    for (const nome of [N, 'Llanowar Elves']) {
      const id = tg.bf(nome);
      expect(tg.state.objects[id].tapped).toBe(false);
      expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    }
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
    // segunda vez no mesmo turno: não dispara
    tap(tg.g, tg.bf('Llanowar Elves'));
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].tapped).toBe(true);
  });
  it('no turno do oponente, não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Llanowar Elves'], []] });
    tap(tg.g, tg.bf('Llanowar Elves'));
    tg.refresh();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].tapped).toBe(true);
  });
});
