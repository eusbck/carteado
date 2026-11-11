import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Roaming Throne', () => {
  it('é do tipo escolhido e dobra os disparos das criaturas desse tipo', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains'), 'Plains', 'Plains'], []], hand: [['Roaming Throne', 'Wall of Omens'], []], library: [['Opt', 'Opt', 'Opt'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('tipo de criatura') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall')!.id] } : null));
    tg.cast('Roaming Throne').resolve();
    expect(chars(tg.g, tg.bf('Roaming Throne')).subtypes).toContain('Wall');
    tg.cast('Wall of Omens').resolve().resolveAll();
    expect(tg.names(0, 'hand').filter((n) => n === 'Opt').length).toBe(2);
  });
});
