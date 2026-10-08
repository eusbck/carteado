import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Determined Iteration', () => {
  it('copia a ficha original, sem marcadores, com ímpeto; sacrifica na etapa final', () => {
    const tg = setup({ battlefield: [['Determined Iteration', { name: 'Elemental 4/4', token: true, counters: { '+1/+1': 2 } }], []], library: [[], ['Island']] });
    tg.passTo('beginCombat');
    const els = tg.all('Elemental');
    expect(els.length).toBe(2);
    const nova = els.find((id) => !tg.state.objects[id].counters['+1/+1'])!;
    expect(tg.pt(nova)).toEqual([4, 4]);
    expect(hasKw(tg.g, nova, 'haste')).toBe(true);
    tg.passTo('end');
    expect(tg.all('Elemental').length).toBe(1);
  });
  it('sem ficha de criatura, nada acontece', () => {
    const tg = setup({ battlefield: [['Determined Iteration', 'Elvish Mystic'], []] });
    tg.passTo('beginCombat');
    expect(tg.state.zones.battlefield.length).toBe(2);
  });
});
