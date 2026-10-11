import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Lion Sash';

describe(N, () => {
  it('{W}: exila a carta alvo de um cemitério; se era carta de permanente, ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], graveyard: [['Hex'], ['Elvish Mystic']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    tg.choose('carta alvo', ['Elvish Mystic']).activate(N, '{W}').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.script.length = 0;
    tg.choose('carta alvo', ['Hex']).activate(N, '{W}').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Hex']);
    expect(tg.pt(id)).toEqual([2, 2]);
  });

  it('reconfigurar {2}: anexado, deixa de ser criatura e a criatura equipada recebe +1/+1 por marcador; desanexado, volta a ser criatura', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', ...Array(4).fill('Plains')], []] });
    const id = tg.bf(N);
    tg.state.objects[id].counters['+1/+1'] = 2;
    tg.refresh();
    tg.choose('outra criatura alvo', ['Elvish Mystic']).activate(N, 'anexe').resolveAll();
    expect(tg.state.objects[id].attachedTo).toBe(tg.bf('Elvish Mystic'));
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
    tg.activate(N, 'desanexe').resolveAll();
    expect(tg.state.objects[id].attachedTo).toBeNull();
    expect(chars(tg.g, id).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });
});
