import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Splendid Reclamation', () => {
  it('os terrenos voltam virados, mesmo os que entrariam desvirados por uma condição', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Splendid Reclamation'], []], graveyard: [['Shifting Woodland', 'Mountain', "Night's Whisper"], []] });
    tg.cast('Splendid Reclamation').resolve();
    for (const n of ['Shifting Woodland', 'Mountain']) expect(tg.state.objects[tg.bf(n)].tapped).toBe(true);
    expect(tg.names(0, 'graveyard').sort()).toEqual(["Night's Whisper", 'Splendid Reclamation'].sort());
  });
});
