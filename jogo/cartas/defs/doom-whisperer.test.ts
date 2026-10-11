import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Doom Whisperer';

describe(N, () => {
  it('pagando 2 de vida, vigia 2: cada carta vai para o cemitério ou fica no topo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Hex', 'Sol Ring', 'Island'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'trample')).toBe(true);
    const [hex] = tg.state.zones.library[0];
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, i.id === String(hex) ? 'graveyard' : 'top'])), order: d.items.map((i) => i.id) } : null));
    tg.activate(N, 'Pague 2 de vida').resolveAll();
    expect(tg.life(0)).toBe(38);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.names(0, 'library')).toEqual(['Sol Ring', 'Island']);
  });
});
