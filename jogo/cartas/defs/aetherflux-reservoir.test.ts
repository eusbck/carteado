import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aetherflux Reservoir';

describe(N, () => {
  it('a segunda mágica do turno dá 2 de vida, contando a que disparou', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Sol Ring', 'Silver Myr'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.life(0)).toBe(41);
    tg.cast('Silver Myr').resolveAll();
    expect(tg.life(0)).toBe(43);
  });

  it('conjurar o próprio Aetherflux Reservoir não dispara', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
  });

  it('pague 50 de vida: 50 de dano a qualquer alvo', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg.state.players[0].life = 60;
    tg.refresh();
    tg.choose('alvo', ['Bruno']).activate(N).resolveAll();
    expect(tg.life(0)).toBe(10);
    expect(tg.life(1)).toBe(-10);
    expect(tg.state.players[1].lost).toBe(true);
  });
});