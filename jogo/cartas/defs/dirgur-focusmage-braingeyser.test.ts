import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const DIRGUR = 'Dirgur Focusmage // Braingeyser';

describe(DIRGUR, () => {
  it('ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação; a redução vale para o feitiço preparado', () => {
    const tg = setup({
      battlefield: [[DIRGUR, 'Island', 'Island', 'Mountain', 'Mountain', 'Island', 'Island', 'Island'], []],
      hand: [['Splatter Technique'], []], library: [Array(8).fill('Plains'), []],
    });
    tg.choose('modo', ['Compre quatro cartas']).cast('Splatter Technique').resolve();
    const d = tg.bf(DIRGUR);
    expect(tg.state.objects[d].prepared).toBe(true);
    expect(tg.state.zones.exile.length).toBe(1);
    tg.resolve(); // Splatter Technique
    expect(tg.names(0, 'hand').length).toBe(4);
    // conjura a cópia preparada (X = 2): {2}{U}{U} − 1 = 3 manas
    tg.number('valor de X', 2).choose('jogador alvo', ['Ana']).cast('Braingeyser', 'prepared');
    expect(tg.state.objects[d].prepared).toBe(false);
    tg.resolve();
    expect(tg.names(0, 'hand').length).toBe(6);
    expect(tg.state.zones.exile.length).toBe(0); // a cópia deixou de existir
  });
  it('mágica de valor de mana menor que 5 não prepara', () => {
    const tg = setup({ battlefield: [[DIRGUR, 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Plains', 'Plains'], []] });
    tg.cast("Night's Whisper").resolveAll();
    expect(tg.state.objects[tg.bf(DIRGUR)].prepared).toBe(false);
  });
});
