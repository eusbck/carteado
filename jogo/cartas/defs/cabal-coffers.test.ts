import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

describe('Cabal Coffers', () => {
  it('conta os terrenos com o subtipo Swamp', () => {
    const tg = setup({ battlefield: [['Cabal Coffers', 'Swamp', 'Swamp', 'Watery Grave'], []] });
    const id = tg.bf('Cabal Coffers');
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''))).toEqual(['BBB']);
  });
});
