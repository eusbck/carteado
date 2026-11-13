import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Spelunking';

describe(N, () => {
  it('o terreno que entraria virado entra desvirado', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Rocky Tar Pit'], []], graveyard: [['Mountain'], []] });
    tg.play('Rocky Tar Pit');
    expect(tg.state.objects[tg.bf('Rocky Tar Pit')].tapped).toBe(false);
  });
  it('o terreno posto pelo gatilho dela entra desvirado; o que entra junto com ela, não', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N, 'Rocky Tar Pit'], []], library: [['Island'], []] });
    tg.choose('você pode colocar uma carta de terreno', ['Rocky Tar Pit']).cast(N).resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf('Rocky Tar Pit')].tapped).toBe(false);
    expect(tg.life(0)).toBe(40);
  });
});
