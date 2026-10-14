import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Brash Taunter';

describe(NOME, () => {
  it('luta com uma 2/10: recebe 2 e causa 2 ao oponente alvo; continua no campo (indestrutível)', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Mountain', 'Mountain'], ['Indomitable Ancients']] });
    tg.choose('outra criatura', ['Indomitable Ancients']).activate(NOME, 'luta').resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(1);
    expect(tg.life(1)).toBe(38);
    expect(tg.find(NOME)).not.toBeNull();
  });
});
