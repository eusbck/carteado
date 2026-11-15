import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Essence Scatter';
describe(N, () => {
  it('anula a mágica de criatura alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island', 'Island']], hand: [['Wall of Omens'], [N]] });
    tg.cast('Wall of Omens').pass();
    tg.choose('mágica de criatura alvo', ['Wall of Omens']).cast(N).resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
  it('também anula uma mágica de criatura artefato', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], ['Island', 'Island']], hand: [['Ornithopter of Paradise'], [N]] });
    tg.cast('Ornithopter of Paradise').pass();
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Ornithopter of Paradise']);
  });
  it('não pode mirar feitiços nem habilidades', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], [N]] });
    tg.cast("Night's Whisper").pass();
    expect(tg.canCast(N)).toBe(false);
  });
});
