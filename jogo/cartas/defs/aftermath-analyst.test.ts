import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Aftermath Analyst';

describe(N, () => {
  it('ao entrar, moi três; sacrificando, os terrenos do cemitério voltam virados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Mountain', 'Swamp', "Night's Whisper", 'Island'], []] });
    tg.cast(N).resolve().resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Mountain', "Night's Whisper", 'Swamp']);
    tg.activate(N).resolve();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, "Night's Whisper"].sort());
  });
});
