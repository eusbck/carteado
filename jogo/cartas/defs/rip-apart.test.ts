import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rip Apart', () => {
  it('modo 1: 3 de dano ao planeswalker alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], [{ name: 'Quintorius, History Chaser', counters: { loyalty: 5 } }]], hand: [['Rip Apart'], []] });
    tg.choose('modo', ['Causa 3 de dano à criatura ou planeswalker alvo']).choose('criatura ou planeswalker', ['Quintorius, History Chaser']).cast('Rip Apart').resolve();
    expect(tg.state.objects[tg.bf('Quintorius, History Chaser')].counters.loyalty).toBe(2);
  });
  it('modo 2: destrói artefato ou encantamento alvo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], ['Sol Ring']], hand: [['Rip Apart'], []] });
    tg.choose('modo', ['Destrua o artefato ou encantamento alvo']).choose('artefato ou encantamento', ['Sol Ring']).cast('Rip Apart').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
