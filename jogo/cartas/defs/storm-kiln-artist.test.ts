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
  it('copiar a mágica dispara; cada cópia dispara uma vez (Plumb the Forbidden)', () => {
    const tg = setup({ battlefield: [['Storm-Kiln Artist', 'Swamp', 'Swamp', 'Elvish Mystic', 'Wall of Omens'], []], hand: [['Plumb the Forbidden'], []], library: [Array(8).fill('Island'), []] });
    tg.number('quantas vezes', 2).choose('Sacrifique', ['Elvish Mystic']).choose('Sacrifique', ['Wall of Omens']);
    tg.cast('Plumb the Forbidden').resolveAll();
    // uma conjuração e duas cópias: três Tesouros, e cada um dá +1/+0
    expect(tg.all('Treasure').length).toBe(3);
    expect(tg.pt(tg.bf('Storm-Kiln Artist'))).toEqual([5, 2]);
  });
});
