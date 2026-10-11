import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Angelic Chorus';

describe(N, () => {
  it('quando uma criatura sua entra, você ganha vida igual à resistência dela', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(50);
    enterCard(tg, 'Silver Myr', 1);
    enterCard(tg, 'Sol Ring', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(50);
  });
});