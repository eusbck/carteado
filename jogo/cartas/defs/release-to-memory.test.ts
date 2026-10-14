import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Release to Memory';

describe(N, () => {
  it('exila o cemitério do oponente e cria um Spirit 1/1 incolor por carta de criatura', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains')], []], hand: [[N], []], graveyard: [['Elvish Mystic'], ['Ripjaw Raptor', 'Gigantosaurus', 'Sol Ring', 'Forest']] });
    tg.cast(N).resolve();
    expect(tg.state.zones.graveyard[1]).toHaveLength(0);
    expect(tg.names(1, 'exile').sort()).toEqual(['Forest', 'Gigantosaurus', 'Ripjaw Raptor', 'Sol Ring']);
    const sp = tg.all('Spirit');
    expect(sp).toHaveLength(2);
    expect(tg.pt(sp[0])).toEqual([1, 1]);
    expect(chars(tg.g, sp[0]).colors).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic', N]);
  });
});
