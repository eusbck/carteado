import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Boggart Trawler // Boggart Bog';

describe(N, () => {
  it('a frente exila o cemitério do jogador alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [[], ['Forest', "Night's Whisper"]] });
    tg.choose('jogador alvo', ['Bruno']).cast(N, 'hand').resolve().resolve();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.state.zones.exile.length).toBe(2);
  });
  it('o verso entra virado se você não pagar 3 de vida', () => {
    const tg = setup({ hand: [[N], []] });
    tg.yes('Pagar 3 de vida', false).play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const tg2 = setup({ hand: [[N], []] });
    tg2.yes('Pagar 3 de vida', true).play(N);
    expect(tg2.state.objects[tg2.bf(N)].tapped).toBe(false);
    expect(tg2.life(0)).toBe(37);
  });
});
