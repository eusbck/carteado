import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Vengeful Bloodwitch', () => {
  it('CR 603.10a: morrendo junto, dispara para cada uma, inclusive ela', () => {
    const tg = setup({ players: 3, battlefield: [['Vengeful Bloodwitch', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], [], []], hand: [['Toxic Deluge'], [], []] });
    tg.choose('oponente alvo', ['Carla']);
    tg.choose('oponente alvo', ['Carla']);
    tg.number('valor de X', 1).cast('Toxic Deluge').resolve().resolveAll();
    expect(tg.find('Vengeful Bloodwitch')).toBeNull();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([39 + 2, 40, 38]);
  });
});
