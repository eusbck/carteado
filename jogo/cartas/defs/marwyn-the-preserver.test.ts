import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Marwyn, the Preserver';

describe(N, () => {
  it('os seus terrenos têm resistência a magia; {2}: devolve um terreno do cemitério à mão', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], ['Mountain']], graveyard: [['Swamp', "Night's Whisper"], []] });
    expect(hasKw(tg.g, tg.bf('Forest'), 'hexproof')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Mountain'), 'hexproof')).toBe(false);
    tg.activate(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});
