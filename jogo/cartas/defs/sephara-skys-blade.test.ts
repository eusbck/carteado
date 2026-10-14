import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = "Sephara, Sky's Blade";
const voadores = ['Segovian Angel', 'Youthful Valkyrie', 'Baleful Strix', 'Inspiring Overseer'].map((name) => ({ name, ready: false }));

describe(N, () => {
  it('pelo custo alternativo, vira quatro criaturas suas com voar, mesmo as que acabaram de entrar', () => {
    const tg = setup({ battlefield: [['Plains', ...voadores, 'Slither Blade'], []], hand: [[N], []] });
    tg.cast(N, 'sephara').resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(voadores.every((v) => tg.state.objects[tg.bf(v.name)].tapped)).toBe(true);
    expect(tg.state.objects[tg.bf('Slither Blade')].tapped).toBe(false);
  });

  it('as outras criaturas suas com voar têm indestrutível', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel', 'Slither Blade'], ['Baleful Strix']] });
    expect(hasKw(tg.g, tg.bf('Segovian Angel'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Slither Blade'), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Baleful Strix'), 'indestructible')).toBe(false);
  });

  it('sem quatro criaturas com voar, não há o custo alternativo', () => {
    const tg = setup({ battlefield: [['Plains', ...voadores.slice(0, 3), 'Slither Blade'], []], hand: [[N], []] });
    expect(tg.actionIds().some((a) => a.endsWith(':sephara'))).toBe(false);
  });
});
