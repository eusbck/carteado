import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rakdos Charm';
const campo = (): [string[], string[]] => [['Swamp', 'Mountain', 'Elvish Mystic'], ['Sol Ring', 'Silver Myr', 'Elvish Mystic', 'Indomitable Ancients']];

describe(N, () => {
  it('exila o cemitério do jogador alvo', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []], graveyard: [['Hex'], ['Hex', 'Preordain']] });
    tg.choose('modo', ['Exile o cemitério do jogador alvo']).choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'exile').sort()).toEqual(['Hex', 'Preordain']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Hex', N].sort());
  });

  it('destrói o artefato alvo', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []] });
    tg.choose('modo', ['Destrua o artefato alvo']).choose('artefato alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('cada criatura causa 1 de dano ao controlador dela', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []] });
    tg.choose('modo', ['Cada criatura causa 1 de dano ao controlador dela']).cast(N).resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([39, 37]);
  });
});
