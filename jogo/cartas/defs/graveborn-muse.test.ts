import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Graveborn Muse', () => {
  it('na sua manutenção, compra e perde X, X = Zombies que você controla (inclusive ela)', () => {
    const tg = setup({
      step: 'end', active: 1,
      battlefield: [['Graveborn Muse', { name: 'Zombie 2/2', token: true }, 'Wall of Omens'], ["Stitcher's Supplier"]],
      library: [['Island', 'Plains', 'Forest', 'Swamp'], ['Island']],
    });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0).resolve();
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.life(0)).toBe(38);
  });
  it('não dispara na manutenção do oponente', () => {
    const tg = setup({ step: 'end', battlefield: [['Graveborn Muse'], []], library: [['Island'], ['Island', 'Plains']] });
    tg.passTo('draw', 1);
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.life(0)).toBe(40);
  });
});
