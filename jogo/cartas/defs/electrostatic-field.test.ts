import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Electrostatic Field';

describe(N, () => {
  it('o gatilho causa 1 de dano a cada oponente antes de a mágica resolver', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Island'], [], []], hand: [['Opt'], [], []], library: [['Plains'], [], []] });
    tg.cast('Opt').resolve();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
    expect(tg.find('Opt', 'stack')).not.toBeNull();
  });

  it('defensor: não pode atacar', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.passTo('declareAttackers');
    expect(tg.state.combat?.attackers ?? []).toHaveLength(0);
  });
});
