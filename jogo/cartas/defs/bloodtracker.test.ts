import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bloodtracker';

describe(N, () => {
  it('{B}, 2 de vida: um marcador +1/+1; ao sair do campo, compra uma carta por marcador', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp'], []], library: [Array(6).fill('Swamp'), []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.activate(N, '{B}, Pague 2 de vida').resolveAll();
    tg.activate(N, '{B}, Pague 2 de vida').resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(tg.life(0)).toBe(36);
    tg.run(exile(tg.g, [id]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });
});
