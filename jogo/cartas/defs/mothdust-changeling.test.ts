import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mothdust Changeling';

describe(N, () => {
  it('virando a si mesma com enjoo de invocação, ganha voar', () => {
    const tg = setup({ battlefield: [[{ name: N, ready: false }], []] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).subtypes).toContain('Ninja');
    tg.activate(N, 'voar').resolve();
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });
});
