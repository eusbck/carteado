import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Minas Morgul, Dark Fortress';

describe(N, () => {
  it('{3}{B}, {T}: a criatura alvo ganha um marcador de sombra, passa a ter sombra e vira Wraith', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Swamp'), 'Serra Angel'], ['Indomitable Ancients']] });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Serra Angel') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.activate(N, 'sombra').resolveAll();
    const anjo = tg.bf('Serra Angel');
    expect(tg.state.objects[anjo].counters.shadow).toBe(1);
    expect(hasKw(tg.g, anjo, 'shadow')).toBe(true);
    expect(chars(tg.g, anjo).subtypes).toContain('Wraith');
    expect(canBlock(tg.g, tg.bf('Indomitable Ancients'), anjo)).toBe(false);
  });
});