import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Herald of War';

describe(N, () => {
  it('ao atacar, recebe um marcador +1/+1 antes dos bloqueios', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(1);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(36);
  });

  it('conta todos os marcadores +1/+1 dela, não só os do ataque', () => {
    // dois marcadores: Angel of Finality ({3}{W}) e Aeronaut Admiral (Human, {3}{W}) custam {1}{W}; Always Watching ({1}{W}{W}) não muda
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }, 'Plains', 'Plains'], []], hand: [['Angel of Finality', 'Aeronaut Admiral', 'Always Watching'], []] });
    expect(tg.canCast('Angel of Finality')).toBe(true);
    expect(tg.canCast('Aeronaut Admiral')).toBe(true);
    expect(tg.canCast('Always Watching')).toBe(false);
  });
});
