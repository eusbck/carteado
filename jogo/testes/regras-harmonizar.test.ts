// lote4-c: harmonizar (harmonize, CR 702.180), em motor/harmonizar.ts.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

const N = "Nature's Rhythm";

describe('Harmonizar (CR 702.180)', () => {
  it('CR 702.180a: a força da criatura virada reduz só o genérico; o resto do custo é pago', () => {
    // {X}{G}{G}{G}{G} com X = 4 e uma criatura de força 2: paga {2}{G}{G}{G}{G}, as seis Florestas
    const tg = setup({
      battlefield: [[...Array(6).fill('Forest'), 'Indomitable Ancients'], []],
      graveyard: [[N], []],
      library: [['Armorcraft Judge'], []],
    });
    tg.number('X', 4).choose('Harmonizar', ['Indomitable Ancients (força 2)']).choose('procure uma carta de criatura', ['Armorcraft Judge']);
    tg.cast(N, 'harmonize').resolve();
    tg.resolveAll();
    expect(tg.find('Armorcraft Judge')).not.toBeNull();
    expect(tg.all('Forest').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('CR 702.180a: sem virar criatura, paga o custo de harmonizar inteiro', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest'), 'Indomitable Ancients'], []], graveyard: [[N], []], library: [['Llanowar Elves'], []] });
    tg.number('X', 0).choose('Harmonizar', []);
    tg.cast(N, 'harmonize').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(false);
    expect(tg.all('Forest').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('CR 702.180a: anulada, a carta vai para o exílio em vez do cemitério', () => {
    const tg = setup({
      battlefield: [[...Array(4).fill('Forest')], ['Island', 'Island']],
      graveyard: [[N], []],
      hand: [[], ['Counterspell']],
    });
    tg.number('X', 0).cast(N, 'harmonize');
    tg.pass();
    tg.choose('mágica alvo', [N]).cast('Counterspell');
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});
