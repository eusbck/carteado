import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Zack Fair';

describe(C, () => {
  it('entra com um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(1);
  });
  it('o alvo ganha indestrutível, os marcadores de Zack e o Equipamento', () => {
    const tg = setup({ battlefield: [['Plains', { name: C, counters: { '+1/+1': 2 } }, { name: 'Basilisk Collar', attachTo: C }, 'Elvish Mystic'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('Anexe', ['Basilisk Collar']).activate(C, 'Sacrifique').resolve();
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.find(C)).toBeNull();
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
    expect(tg.state.objects[elfo].counters['+1/+1']).toBe(2);
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(elfo);
  });
});
