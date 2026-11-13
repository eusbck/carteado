import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Võx, Child of the Collective';

describe(N, () => {
  it('CR 702.125a: ao entrar, a próxima mágica de criatura artefato custa {1} a menos por oponente, só a próxima', () => {
    // três jogadores: dois oponentes; Hive Mind Coprocessor custa {4}{B} e passa a custar {2}{B}
    const tg = setup({
      players: 3,
      battlefield: [[...Array(5).fill('Island'), ...Array(6).fill('Swamp')], [], []],
      hand: [[N, 'Hive Mind Coprocessor', 'Hive Mind Coprocessor'], [], []],
    });
    tg.cast(N).resolveAll();
    // sobram seis Swamps; a primeira custa três
    tg.cast('Hive Mind Coprocessor').resolveAll();
    expect(tg.all('Hive Mind Coprocessor')).toHaveLength(1);
    // a segunda já não tem destemido: os três Swamps que sobram não pagam {4}{B}
    expect(tg.canCast('Hive Mind Coprocessor')).toBe(false);
  });

  it('a próxima mágica de Spacecraft também tem destemido, à parte', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Island'), 'Island', 'Island'], []], hand: [[N, 'Transwarp Hub'], []] });
    tg.cast(N).resolveAll();
    // Transwarp Hub {2}{U} com um oponente custa {1}{U}: os dois Islands que sobraram pagam
    expect(tg.canCast('Transwarp Hub')).toBe(true);
    tg.cast('Transwarp Hub').resolveAll();
    expect(tg.find('Transwarp Hub')).not.toBeNull();
  });
});
