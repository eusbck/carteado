import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Wakestone Gargoyle', () => {
  it('a própria Gargoyle e as outras com defensor podem atacar', () => {
    const tg = setup({ battlefield: [[{ name: 'Wakestone Gargoyle', ready: true }, { name: 'Wall of Limbs', ready: true }, 'Plains', 'Plains'], []], library: [['Island'], ['Island']] });
    tg.activate('Wakestone Gargoyle').resolve();
    tg.attack([['Wakestone Gargoyle', 1], ['Wall of Limbs', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
  });
  it('sem ativar, não ataca', () => {
    const tg = setup({ battlefield: [[{ name: 'Wakestone Gargoyle', ready: true }], []], library: [['Island'], ['Island']] });
    let pode = false; // sem candidatos, o motor nem pede atacantes
    tg.script.push((d) => (d.kind === 'attackers' ? (pode = d.candidates.some((x) => x.obj === tg.bf('Wakestone Gargoyle') && x.targets.length > 0), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(pode).toBe(false);
  });
});
