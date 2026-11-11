import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fabricate', () => {
  it('busca um artefato para a mão', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Island')], []], hand: [['Fabricate'], []], library: [['Opt', 'Sol Ring', 'Forest'], []] });
    tg.choose('artefato', ['Sol Ring']).cast('Fabricate').resolve();
    expect(tg.names(0, 'hand')).toContain('Sol Ring');
  });
});
