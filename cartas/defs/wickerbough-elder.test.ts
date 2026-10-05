import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wickerbough Elder', () => {
  it('entra com -1/-1; remove o marcador para destruir artefato ou encantamento', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Forest')], ['Sol Ring']], hand: [['Wickerbough Elder'], []] });
    tg.cast('Wickerbough Elder').resolve();
    const w = tg.bf('Wickerbough Elder');
    expect(tg.pt(w)).toEqual([3, 3]);
    tg.choose('artefato ou encantamento', ['Sol Ring']);
    tg.activate('Wickerbough Elder').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.pt(w)).toEqual([4, 4]);
  });
  it('sem alvo, não pode ativar', () => {
    const tg = setup({ battlefield: [[{ name: 'Wickerbough Elder', counters: { '-1/-1': 1 } }, 'Forest'], []] });
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Wickerbough Elder')}:`))).toBe(false);
  });
});
