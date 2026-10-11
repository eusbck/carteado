import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Scourglass';

describe(N, () => {
  it('na sua manutenção, destrói tudo menos artefatos e terrenos, inclusive criaturas artefato', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Island', 'Serra Angel', 'Righteous Cause'], ['Silver Myr', 'Indomitable Ancients', 'Forest']] });
    // fora da sua manutenção não pode
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg.passTo('upkeep', 0);
    tg.activate(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Righteous Cause')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.find('Forest')).not.toBeNull();
  });
});