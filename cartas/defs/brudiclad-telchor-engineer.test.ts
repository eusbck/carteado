import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Brudiclad, Telchor Engineer', () => {
  it('a Myr nova e um Tesouro viram cópias da ficha escolhida; fichas de criatura têm ímpeto', () => {
    const tg = setup({ battlefield: [['Brudiclad, Telchor Engineer', { name: 'Treasure', token: true }, { name: 'Spirit 3/2', token: true }], []], library: [['Island'], ['Island']] });
    tg.choose('Brudiclad: escolha uma ficha', ['Spirit']);
    tg.passTo('beginCombat').resolve();
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken);
    expect(fichas.length).toBe(3);
    expect(fichas.map((id) => chars(tg.g, id).name)).toEqual(['Spirit', 'Spirit', 'Spirit']);
    expect(fichas.every((id) => hasKw(tg.g, id, 'haste'))).toBe(true);
  });
});
