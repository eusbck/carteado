import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Fling';

describe(NOME, () => {
  it('o dano é a força da criatura sacrificada como estava no campo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Zetalpa, Primal Dawn'], []], hand: [[NOME], []] });
    tg.choose('Sacrifique', ['Zetalpa, Primal Dawn']).choose('alvo', ['Bruno']).cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Zetalpa, Primal Dawn']);
    tg.resolve();
    expect(tg.life(1)).toBe(40 - 4);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Indomitable Ancients']], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
