import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Transcendent Envoy', () => {
  it('Auras custam {1} a menos; outros encantamentos não', () => {
    const tg = setup({ battlefield: [['Transcendent Envoy', 'Plains'], []], hand: [['Spirit Mantle', 'Ghostly Prison'], []] });
    expect(tg.canCast('Spirit Mantle')).toBe(true); // {1}{W} por {W}
    expect(tg.canCast('Ghostly Prison')).toBe(false);
  });
});
