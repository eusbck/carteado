import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Tiller Engine';

describe(N, () => {
  it('terreno que entra virado: desvira-o', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Rocky Tar Pit'], []] });
    tg.choose('modo', ['Desvire esse terreno']).play('Rocky Tar Pit').resolve();
    expect(tg.state.objects[tg.bf('Rocky Tar Pit')].tapped).toBe(false);
  });
  it('ou vira uma permanente que não é terreno de um oponente', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']], hand: [['Rocky Tar Pit'], []] });
    tg.choose('modo', ['Vire a permanente alvo que não é terreno que um oponente controla']).play('Rocky Tar Pit').resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
  });
  it('terreno desvirado não dispara', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
