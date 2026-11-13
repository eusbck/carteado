import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rocky Tar Pit';

describe(N, () => {
  it('entra virado; sacrificado, busca um Swamp ou Mountain para o campo desvirado', () => {
    const tg = setup({ hand: [[N], []], library: [['Island', 'Mountain'], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    tg.state.objects[tg.bf(N)].tapped = false;
    tg.refresh().choose('Procure', ['Mountain']).activate(N).resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(false);
  });
  it('a busca pode não achar nada', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Swamp'], []] });
    tg.choose('Procure', []).activate(N).resolve();
    expect(tg.find('Swamp')).toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });
});
