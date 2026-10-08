import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe("Inspired Skypainter // Maestro's Gift", () => {
  it('ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação e cria a ficha com ímpeto', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), ...Array(3).fill('Mountain')], []], hand: [["Inspired Skypainter // Maestro's Gift"], []] });
    tg.cast('Inspired Skypainter').resolve().resolveAll();
    const s = tg.bf('Inspired Skypainter');
    expect(tg.state.objects[s].prepared).toBe(true);
    tg.choose('criatura alvo que você controla', ['Inspired Skypainter']);
    tg.cast("Maestro's Gift", 'prepared').resolve().resolveAll();
    expect(tg.state.objects[s].prepared).toBeFalsy();
    const f = tg.state.zones.battlefield.find((id) => tg.state.objects[id].isToken)!;
    expect(hasKw(tg.g, f, 'haste')).toBe(true);
    expect(tg.state.objects[f].prepared).toBe(true); // a ficha também entra e fica preparada
  });
});
