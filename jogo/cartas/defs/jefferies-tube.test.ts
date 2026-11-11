import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { canBlock } from '../../motor/combat.ts';

const N = 'Jefferies Tube';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('{2}, {T}: dois marcadores de carga no artefato alvo', () => {
    const tg = setup({ battlefield: [[N, ...ilhas, 'Sol Ring'], []] });
    tg.choose('artefato alvo', ['Sol Ring']).activate(N, 'carga').resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].counters.charge).toBe(2);
  });
  it('{3}, {T}: a criatura alvo sua não pode ser bloqueada neste turno', () => {
    const tg = setup({ battlefield: [[N, ...ilhas, 'Elvish Mystic'], ['Wall of Omens']] });
    tg.activate(N, 'não pode ser bloqueada').resolve();
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(false);
  });
  it('{4}, {T}: compra e pode pôr um terreno da mão no campo, virado', () => {
    const tg = setup({ battlefield: [[N, ...ilhas], []], library: [['Forest'], []] });
    tg.choose('Jefferies Tube', ['Forest']).activate(N, 'Compre').resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
});
