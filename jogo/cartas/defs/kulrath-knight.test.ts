import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Kulrath Knight', () => {
  it('qualquer tipo de marcador impede', () => {
    const tg = setup({ active: 1, battlefield: [['Kulrath Knight'], [{ name: 'Gau, Feral Youth', counters: { oil: 1 } }, 'Glissa Sunslayer']], library: [['Island'], ['Island']] });
    let cands: number[] = [];
    tg.script.push((d) => (d.kind === 'attackers' ? (cands = d.candidates.map((x: { obj: number }) => x.obj), { kind: 'attackers', attacks: [] }) : null));
    tg.passTo('main2');
    expect(cands).not.toContain(tg.bf('Gau, Feral Youth'));
    expect(cands).toContain(tg.bf('Glissa Sunslayer'));
  });
});
