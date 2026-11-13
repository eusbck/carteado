import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Prismatic Vista';

describe(NOME, () => {
  it('paga 1 de vida, sacrifica e põe um terreno básico desvirado no campo', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Forest'], []] });
    tg.choose('terreno básico', ['Forest']).activate(NOME).resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
});
