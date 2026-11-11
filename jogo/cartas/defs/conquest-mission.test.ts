import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Conquest Mission';

describe(N, () => {
  it('um artefato que não é ficha entra: marcador de missão e uma ficha Borg (a ficha criada não dispara)', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(1);
    expect(tg.all('Borg')).toHaveLength(1);
  });

  it('com seis ou mais marcadores de missão, cria duas fichas', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { quest: 5 } }, 'Plains'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.quest).toBe(6);
    expect(tg.all('Borg')).toHaveLength(2);
  });
});
