import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Cloud Key', () => {
  it('a mágica do tipo escolhido custa {1} a menos', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Island')], []], hand: [['Cloud Key', 'Sol Ring'], []] });
    tg.choose('tipo de carta', ['artefato']).cast('Cloud Key').resolve();
    expect(tg.canCast('Sol Ring')).toBe(true); // Sol Ring de graça
  });
});
