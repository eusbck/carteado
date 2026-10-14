import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Whiptongue Hydra';

describe(N, () => {
  it('destrói as criaturas com voar e conta só as destruídas (indestrutível não conta)', () => {
    const tg = fixture({ battlefield: [['Birds of Paradise'], ['Birds of Paradise', 'Zetalpa, Primal Dawn', 'Indomitable Ancients']] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Birds of Paradise')).toHaveLength(0);
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });
});
