import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Vraska, the Cutting Glare';

describe(N, () => {
  it('com seis terrenos, destrói a permanente alvo de um oponente, que cria um Tesouro', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Forest', 'Forest', 'Forest', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Sol Ring']).cast(N).resolve().resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    const tesouro = tg.bf('Treasure');
    expect(tg.state.objects[tesouro].controller).toBe(1);
  });
  it('com menos de seis terrenos, o gatilho não dispara', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Forest', 'Forest', 'Forest'], ['Sol Ring']], hand: [[N], []] });
    tg.cast(N).resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
