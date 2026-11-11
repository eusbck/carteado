import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Borg Incursion';

describe(N, () => {
  it('cria duas fichas Borg e as criaturas artefato ganham proteção contra a cor escolhida até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Steel Overseer', 'Wall of Omens'], []], hand: [[N], []] });
    tg.choose('cor da proteção', ['vermelho']).cast(N).resolveAll();
    expect(tg.all('Borg')).toHaveLength(2);
    for (const id of [...tg.all('Borg'), tg.bf('Steel Overseer')]) expect(kwParams(tg.g, id, 'protection')).toContain('color:R');
    expect(kwParams(tg.g, tg.bf('Wall of Omens'), 'protection')).toEqual([]);
  });
});
