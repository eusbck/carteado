import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Malfegor';

describe(N, () => {
  it('você descarta a mão inteira e cada oponente sacrifica uma criatura para cada carta descartada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients', 'Silver Myr', 'Elvish Mystic']], hand: [[N, 'Island', 'Forest'], []] });
    tg.choose('sacrific', ['Silver Myr', 'Elvish Mystic']);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island']);
    expect(tg.state.zones.battlefield.filter((x) => tg.state.objects[x].controller === 1)).toHaveLength(1);
  });

  it('com a mão vazia, ninguém sacrifica', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
});