import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Redemption Arc', () => {
  it('indestrutível e goadada; {1}{W} exila a criatura encantada', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', { name: 'Redemption Arc', attachTo: 'Gau, Feral Youth' }], ['Gau, Feral Youth']] });
    const gau = tg.bf('Gau, Feral Youth');
    expect(hasKw(tg.g, gau, 'indestructible')).toBe(true);
    tg.activate('Redemption Arc').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Gau, Feral Youth']);
  });
});
