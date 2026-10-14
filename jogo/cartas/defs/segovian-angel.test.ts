import { describe, expect, it } from 'vitest';
import { forcaResistencia, temPalavrasChave } from '../../testes/padroes.ts';

const N = 'Segovian Angel';

describe(N, () => {
  it('1/1 com voar e vigilância', () => {
    expect(forcaResistencia(N)).toEqual([1, 1]);
    expect(temPalavrasChave(N, 'flying', 'vigilance')).toBe(true);
  });
});
