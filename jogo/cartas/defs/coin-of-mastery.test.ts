import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Coin of Mastery';

describe(N, () => {
  it('a criatura entra com um marcador +1/+1 para cada mana de artefato gasta nela; {T}: cria um Treasure', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Silver Myr'], []] });
    tg.cast('Silver Myr').resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    tg.activate(N).resolveAll();
    expect(tg.all('Treasure')).toHaveLength(1);
    const terra = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Silver Myr'], []] });
    terra.cast('Silver Myr').resolveAll();
    expect(terra.pt(terra.bf('Silver Myr'))).toEqual([1, 1]);
  });
});