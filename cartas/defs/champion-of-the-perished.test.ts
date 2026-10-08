import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Champion of the Perished', () => {
  it('cada outro Zombie que você controla entrando põe um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Champion of the Perished'], []] });
    tg.run(createTokens(tg.g, 0, 'Zombie 2/2', 2));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Champion of the Perished')].counters['+1/+1']).toBe(2);
    expect(tg.pt(tg.bf('Champion of the Perished'))).toEqual([3, 3]);
  });
  it('não conta a si mesmo, não Zombies nem Zombies dos oponentes', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [['Champion of the Perished'], []] });
    tg.cast('Champion of the Perished').resolveAll();
    tg.run(createTokens(tg.g, 1, 'Zombie 2/2', 1));
    tg.run(createTokens(tg.g, 0, 'Soldier', 1));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Champion of the Perished')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
