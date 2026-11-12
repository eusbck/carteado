import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Spell Shrivel';
const ND = "Night's Whisper";

describe(N, () => {
  it('devoid: a carta é incolor', () => {
    const tg = setup({ hand: [[N], []] });
    expect(chars(tg.g, tg.find(N, 'hand', 0)!).colors).toEqual([]);
  });
  it('anulada por não pagar {4}, a mágica vai para o exílio', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island', 'Island']], hand: [[ND], [N]] });
    tg.cast(ND).pass();
    tg.yes('Pagar {4}', false);
    tg.choose('mágica alvo', [ND]).cast(N).resolve();
    expect(tg.names(0, 'exile')).toEqual([ND]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
  it('pagando {4}, a mágica resolve e vai para o cemitério normalmente', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Island', 'Island', 'Island']], hand: [[ND], [N]], library: [['Forest', 'Forest'], []] });
    tg.cast(ND).pass();
    tg.yes('Pagar {4}', true);
    tg.choose('mágica alvo', [ND]).cast(N).resolve();
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([ND]);
    expect(tg.life(0)).toBe(38);
  });
});
