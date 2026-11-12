import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ancient Ziggurat', () => {
  it('paga uma mágica de criatura, mas não uma de outro tipo', () => {
    const tg = setup({ battlefield: [['Ancient Ziggurat'], []], hand: [['Llanowar Elves', 'Sol Ring'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.includes(String(tg.find('Sol Ring', 'hand'))))).toBe(false);
    tg.cast('Llanowar Elves').resolve();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Ancient Ziggurat')].tapped).toBe(true);
  });
});
