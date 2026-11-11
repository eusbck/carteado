import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hydroblast';

describe(N, () => {
  it('anula a mágica alvo vermelha', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Mountain']], hand: [[N], ['Lightning Bolt']] });
    tg.cast('Lightning Bolt').pass().choose('modo(s)', ['Anule a mágica alvo, se ela for vermelha']).cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.names(1, 'graveyard')).toEqual(['Lightning Bolt']);
  });
  it('mira uma mágica que não é vermelha e não faz nada com ela', () => {
    const tg = setup({ active: 1, battlefield: [['Island'], ['Forest']], hand: [[N], ['Elvish Mystic']] });
    tg.cast('Elvish Mystic').pass().choose('modo(s)', ['Anule a mágica alvo, se ela for vermelha']).cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('destrói o permanente alvo vermelho; o que não é vermelho fica', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Young Pyromancer', 'Elvish Mystic']], hand: [[N, N], []] });
    tg.choose('modo(s)', ['Destrua o permanente alvo, se ele for vermelho']).choose('permanente alvo', ['Young Pyromancer']).cast(N).resolve();
    expect(tg.find('Young Pyromancer')).toBeNull();
    tg.choose('modo(s)', ['Destrua o permanente alvo, se ele for vermelho']).choose('permanente alvo', ['Elvish Mystic']).cast(N).resolve();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
