import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Shore Leave Planet';

describe(C, () => {
  it('vira cópia de uma criatura sua, artefato Robot e não lendária', () => {
    const tg = setup({ battlefield: [[C, ...Array(5).fill('Island'), 'Wall of Omens'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(C, 'cópia').resolve();
    const ch = chars(tg.g, tg.state.zones.battlefield.find((id) => tg.state.objects[id].def === C)!);
    expect(ch.name).toBe('Wall of Omens');
    expect(ch.types).toContain('Artifact');
    expect(ch.subtypes).toContain('Robot');
  });
});
