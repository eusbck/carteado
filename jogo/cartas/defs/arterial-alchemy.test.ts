import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Arterial Alchemy';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('os Blood viram Equipamento com +2/+0 e equipar {2}; saindo Arterial Alchemy, deixam de ser e soltam', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(5).fill('Mountain'), 'Elvish Mystic'], [], []], hand: [[N], [], []], library: [lib, lib, lib] });
    tg.cast(N).resolveAll();
    const sangue = tg.all('Blood');
    expect(sangue).toHaveLength(2);
    expect(chars(tg.g, sangue[0]).subtypes.sort()).toEqual(['Blood', 'Equipment']);
    const elfo = tg.bf('Elvish Mystic');
    tg.choose('criatura alvo', ['Elvish Mystic']);
    tg.activate('Blood', 'Equipar').resolveAll();
    const preso = sangue.find((id) => tg.state.objects[id].attachedTo === elfo)!;
    expect(preso).toBeDefined();
    expect(tg.pt(elfo)).toEqual([3, 1]);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(chars(tg.g, preso).subtypes).toEqual(['Blood']);
    expect(tg.state.objects[preso].attachedTo).toBeNull();
    expect(tg.pt(elfo)).toEqual([1, 1]);
  });
});
