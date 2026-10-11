import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { validateAttack } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Basandra, Battle Seraph';

describe(N, () => {
  it('durante o combate ninguém conjura mágicas, nem instantâneas', () => {
    const tg = setup({ battlefield: [[N, 'Island'], ['Island']], hand: [['Consider'], ['Consider']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.canCast('Consider')).toBe(true);
    tg.passTo('beginCombat', 0);
    expect(tg.canCast('Consider')).toBe(false);
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Consider')).toBe(false);
  });

  it('as habilidades continuam podendo ser ativadas durante o combate', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], ['Silver Myr']] });
    tg.passTo('beginCombat', 0);
    tg.choose('criatura alvo', ['Silver Myr']).activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('{R}: a criatura alvo ataca neste turno se puder', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Mountain'], ['Silver Myr']] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.choose('criatura alvo', ['Silver Myr']).activate(N).resolveAll();
    expect(validateAttack(tg.g, 1, [])).not.toBeNull();
    expect(validateAttack(tg.g, 1, [[tg.bf('Silver Myr'), { kind: 'player', id: 0 }]])).toBeNull();
  });
});