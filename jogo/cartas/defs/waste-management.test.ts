import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Waste Management';
const pantanos = (n: number) => Array(n).fill('Swamp');

describe(N, () => {
  it('sem reforço, exila até duas cartas de um mesmo cemitério e cria um Rogue 2/2 por carta de criatura', () => {
    const tg = setup({
      battlefield: [pantanos(3), []], hand: [[N], []],
      graveyard: [['Sol Ring'], ['Elvish Mystic', 'Island', 'Wall of Omens']],
    });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('de um mesmo cemitério', ['Elvish Mystic', 'Island']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Sol Ring', N].sort());
    const ladroes = tg.all('Rogue');
    expect(ladroes).toHaveLength(1);
    expect(tg.pt(ladroes[0])).toEqual([2, 2]);
  });

  it('as duas cartas precisam ser do mesmo cemitério', () => {
    const tg = setup({ battlefield: [pantanos(3), []], hand: [[N], []], graveyard: [['Sol Ring'], ['Elvish Mystic']] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('de um mesmo cemitério', ['Sol Ring', 'Elvish Mystic']);
    expect(() => tg.cast(N)).toThrow();
  });

  it('CR 702.33: reforçada, exila o cemitério inteiro do jogador alvo', () => {
    const tg = setup({
      battlefield: [pantanos(7), []], hand: [[N], []],
      graveyard: [['Sol Ring'], ['Elvish Mystic', 'Island', 'Wall of Omens', 'Silver Myr']],
    });
    tg.choose('custo adicional opcional', ['Pagar: kicker {3}{B}']).choose('jogador alvo', ['Bruno']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Sol Ring', N].sort());
    // três cartas de criatura exiladas
    expect(tg.all('Rogue')).toHaveLength(3);
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
