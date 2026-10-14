import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Ravenous Squirrel';

describe(NOME, () => {
  it('sacrificando uma Food pelo custo: ganha 1, compra uma carta e recebe um marcador', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Food', token: true }, 'Swamp', 'Forest', 'Forest'], []], library: [['Island'], []] });
    tg.choose('Sacrifique', ['Food']).activate(NOME, 'ganha 1').resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(1);
  });
});
