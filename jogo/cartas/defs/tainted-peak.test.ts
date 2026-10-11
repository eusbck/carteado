import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Tainted Peak';

function cores(campo: string[]): string[] {
  const tg = setup({ battlefield: [[NOME, ...campo], []] });
  const id = tg.bf(NOME);
  return [...new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
}

describe(NOME, () => {
  it('sem Swamp, só {C}', () => expect(cores([])).toEqual(['C']));
  it('com um Swamp (inclusive não básico), {B} ou {R}', () => {
    expect(cores(['Swamp'])).toEqual(['B', 'C', 'R']);
    expect(cores(['Underground Sea'])).toEqual(['B', 'C', 'R']);
  });
});
