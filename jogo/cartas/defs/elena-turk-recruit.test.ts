import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Elena, Turk Recruit';

describe(C, () => {
  it('ao entrar, devolve uma carta histórica do cemitério', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Plains')], []], hand: [[C], []], graveyard: [['Basilisk Collar', 'Opt'], []] });
    tg.choose('histórica', ['Basilisk Collar']);
    tg.cast(C).resolveAll();
    expect(tg.names(0, 'hand')).toContain('Basilisk Collar');
  });
  it('mágica histórica (artefato) dá marcador; não histórica não', () => {
    const tg = setup({ battlefield: [[C, 'Plains', 'Plains', 'Island'], []], hand: [['Basilisk Collar', 'Opt'], []], library: [['Opt'], []] });
    tg.cast('Basilisk Collar').resolveAll();
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(1);
    tg.cast('Opt').resolveAll();
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(1);
  });
});
