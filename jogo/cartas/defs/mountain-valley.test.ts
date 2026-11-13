import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mountain Valley';

describe(N, () => {
  it('entra virado; sacrificado, busca um Mountain ou Forest para o campo desvirado', () => {
    const tg = setup({ hand: [[N], []], library: [['Island', 'Forest'], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    tg.state.objects[tg.bf(N)].tapped = false;
    tg.refresh().choose('Procure', ['Forest']).activate(N).resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
  it('a busca pode não achar nada', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Mountain'], []] });
    tg.choose('Procure', []).activate(N).resolve();
    expect(tg.find('Mountain')).toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
  });
});
