import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sunblast Angel';

describe(N, () => {
  it('destrói as criaturas viradas na resolução, inclusive as suas', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', { name: 'Segovian Angel', tapped: true }, 'Slither Blade'], [{ name: 'Baleful Strix', tapped: true }, 'Indomitable Ancients']],
      hand: [[N], []],
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Segovian Angel')).toBeNull();
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Slither Blade')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find(N)).not.toBeNull();
  });
});
