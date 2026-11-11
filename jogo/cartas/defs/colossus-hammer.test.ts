import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Colossus Hammer';

describe(C, () => {
  it('equipar {8}: +10/+10 e perde voar', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Plains'), C, "Archon of Sun's Grace"], []] });
    tg.activate(C, 'Equipar').resolve();
    const arc = tg.bf("Archon of Sun's Grace");
    expect(tg.state.objects[tg.bf(C)].attachedTo).toBe(arc);
    expect(tg.pt(arc)).toEqual([13, 14]);
    expect(hasKw(tg.g, arc, 'flying')).toBe(false);
  });
  it('ruling 1: pode equipar criatura sem voar; ela só não perde nada', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([11, 11]);
  });
  it('ruling 2: voar ganho depois de o Hammer ser anexado fica (camada 6, ordem de carimbo)', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    const elfo = tg.bf('Elvish Mystic');
    const c = { g: tg.g, you: 0, source: tg.bf(C) } as never;
    untilEndOfTurn(c, [elfo], [{ k: 'addKeyword', kw: 'flying' }]);
    tg.refresh();
    expect(hasKw(tg.g, elfo, 'flying')).toBe(true);
  });
});
