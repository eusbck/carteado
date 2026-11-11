import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

describe('Urza, Chief Artificer', () => {
  it('dá ameaça e cria um Construct na etapa final', () => {
    const tg = setup({ battlefield: [['Urza, Chief Artificer', 'Ornithopter', 'Sol Ring'], []], library: [['Opt'], ['Opt']] });
    expect(hasKw(tg.g, tg.bf('Ornithopter'), 'menace')).toBe(true);
    tg.passTo('end').resolveAll();
    const c = tg.all('Construct (artefatos)')[0] ?? tg.state.zones.battlefield.find((id) => tg.state.objects[id].isToken);
    expect(c).toBeDefined();
    expect(tg.pt(c!)).toEqual([3, 3]);
  });
});
