import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Deliver from Chaos';

describe(N, () => {
  it('exila o artefato ou criatura alvo e cria fichas Borg iguais ao valor de mana dele', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Swamp', 'Swamp'], ['Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('artefato ou criatura alvo', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.all('Borg')).toHaveLength(8);
  });
});
