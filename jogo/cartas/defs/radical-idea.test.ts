import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Radical Idea';

describe(N, () => {
  it('conjurada com impulso, descarta uma carta, compra e vai para o exílio; anulada, também vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Island', 'Island']], graveyard: [[N], []], hand: [['Mountain'], ['Counterspell']], library: [['Plains', 'Swamp'], []] });
    tg.choose('Descarte', ['Mountain']).cast(N, 'jump-start');
    expect(tg.names(0, 'graveyard')).toEqual(['Mountain']);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'exile')).toEqual([N]);
  });

  it('sem carta na mão para descartar, não pode usar o impulso', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], graveyard: [[N], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':jump-start'))).toBe(false);
  });

  it('anulada depois do impulso, vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Island', 'Island']], graveyard: [[N], []], hand: [['Mountain'], ['Counterspell']], library: [['Plains'], []] });
    tg.cast(N, 'jump-start');
    tg.pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
