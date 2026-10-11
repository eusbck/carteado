import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Prowler, Clawed Thief';
const lib = Array(6).fill('Swamp');

describe(N, () => {
  it('ameaçar; trama quando outro Villain seu entra: compra, descarta e ganha marcador se descartou carta que não é terreno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Hex'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(hasKw(tg.g, id, 'menace')).toBe(true);
    tg.choose('Descarte', ['Hex']);
    enterCard(tg, 'The Frightful Four', 0);
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });

  it('criatura que não é Villain e Villain do oponente não disparam', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Elvish Mystic'], ['The Frightful Four']], library: [lib, lib] });
    enterCard(tg, 'Elvish Mystic', 0);
    enterCard(tg, 'The Frightful Four', 1);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
