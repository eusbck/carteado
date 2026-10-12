import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Endless Atlas';

describe(N, () => {
  it('{2}, {T}: compra uma carta, só com três ou mais terrenos de mesmo nome', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], library: [['Island', 'Island'], ['Island']] });
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    const sem = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Island'], []], library: [['Island', 'Island'], ['Island']] });
    expect(() => sem.activate(N)).toThrow();
  });
});