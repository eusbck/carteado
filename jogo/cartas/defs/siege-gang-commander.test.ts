import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Siege-Gang Commander';

describe(N, () => {
  it('ao entrar, cria três Goblins 1/1 vermelhos', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.all('Goblin')).toHaveLength(3);
  });

  it('sacrificando um Goblin, até ele mesmo, causa 2 de dano a qualquer alvo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []] });
    tg.choose('Sacrifique', [N]).choose('qualquer alvo', ['Bruno']);
    tg.activate(N, 'Sacrifique um Goblin').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.life(1)).toBe(38);
  });
});
