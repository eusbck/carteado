import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Resculpt', () => {
  it('exila o alvo e o controlador dele cria um Elemental 4/4', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Zetalpa, Primal Dawn']], hand: [['Resculpt'], []] });
    tg.choose('artefato ou criatura', ['Zetalpa, Primal Dawn']).cast('Resculpt').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    const el = tg.bf('Elemental', 1);
    expect(tg.pt(el)).toEqual([4, 4]);
  });
});
