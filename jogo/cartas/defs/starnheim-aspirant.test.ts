import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Starnheim Aspirant';

describe(N, () => {
  it('só mágicas de criatura Angel; reduz só o genérico', () => {
    // Angel of Finality {3}{W} sai com {1}{W}; Inspiring Overseer {2}{W} com {W}; Day of Judgment {2}{W}{W} não muda
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Angel of Finality', 'Day of Judgment'], []] });
    expect(tg.canCast('Day of Judgment')).toBe(false);
    tg.choose('jogador alvo', ['Bruno']).cast('Angel of Finality').resolveAll();
    expect(tg.find('Angel of Finality')).not.toBeNull();
    // Segovian Angel ({W}) não fica de graça: o colorido continua
    const tg2 = setup({ battlefield: [[N], []], hand: [['Segovian Angel'], []] });
    expect(tg2.canCast('Segovian Angel')).toBe(false);
  });
});
