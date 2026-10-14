import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "Rhonas's Monument";

describe(N, () => {
  it('a mágica de criatura verde custa {1} a menos e a criatura alvo recebe +2/+2 e atropelar', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Forest', 'Forest'], []], hand: [['Dungrove Elder'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).cast('Dungrove Elder');
    // o gatilho resolve antes da mágica
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.pt(a)).toEqual([4, 12]);
    expect(hasKw(tg.g, a, 'trample')).toBe(true);
    tg.resolve();
    expect(tg.find('Dungrove Elder')).not.toBeNull();
  });

  it('mágica de criatura que não é verde dispara, mas não fica mais barata', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Forest'], []], hand: [['Silver Myr'], []] });
    expect(tg.canCast('Silver Myr')).toBe(false);
    const tg2 = setup({ battlefield: [[N, 'Indomitable Ancients', 'Forest', 'Forest'], []], hand: [['Silver Myr'], []] });
    tg2.cast('Silver Myr').resolveAll();
    expect(tg2.pt(tg2.bf('Indomitable Ancients'))).toEqual([4, 12]);
  });

  it('a mágica de criatura ainda está na pilha e não pode ser o alvo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Dungrove Elder'], []] });
    tg.cast('Dungrove Elder');
    // sem criatura no campo, o gatilho não tem alvo e não vai para a pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.pt(tg.bf('Dungrove Elder'))).toEqual([2, 2]);
  });
});
