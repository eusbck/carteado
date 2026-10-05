import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Storm-Kiln Artist', () => {
  it('+1/+0 por artefato; conjurar instantânea ou feitiço cria um Tesouro', () => {
    const tg = setup({ battlefield: [['Storm-Kiln Artist', 'Sol Ring', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    expect(tg.pt(tg.bf('Storm-Kiln Artist'))).toEqual([3, 2]);
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.all('Treasure').length).toBe(1);
    expect(tg.pt(tg.bf('Storm-Kiln Artist'))).toEqual([4, 2]);
  });
});
