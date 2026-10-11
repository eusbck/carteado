import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Too Greedily, Too Deep';

describe(N, () => {
  it('põe no campo sob o seu controle uma criatura de qualquer cemitério; ela causa dano igual à força a cada outra criatura', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp'), 'Mountain', 'Elvish Mystic'], ['Indomitable Ancients', 'Silver Myr']], hand: [[N], []], graveyard: [[], ['Knollspine Dragon']] });
    tg.choose('carta de criatura alvo', ['Knollspine Dragon']).choose('oponente alvo', ['Bruno']).yes('Knollspine Dragon', false);
    tg.cast(N).resolveAll();
    const dragao = tg.bf('Knollspine Dragon');
    expect(tg.state.objects[dragao].controller).toBe(0);
    // 7 de dano em cada outra criatura, as suas inclusive
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(7);
    expect(tg.state.objects[dragao].damage).toBe(0);
  });
});
