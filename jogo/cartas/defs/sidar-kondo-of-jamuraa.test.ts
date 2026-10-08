import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sidar Kondo of Jamuraa', () => {
  it('vale mesmo quando outro jogador ataca: sem voar ou alcance, não bloqueia força 2 ou menos', () => {
    const tg = setup({
      players: 3, active: 2, battlefield: [['Sidar Kondo of Jamuraa'], ['Wall of Omens', { name: 'Spider', token: true }], ['Elvish Mystic', 'Glissa Sunslayer']],
      library: [['Island'], ['Island'], ['Island']],
    });
    let cands: { obj: number; canBlock: number[] }[] = [];
    tg.script.push((d) => (d.kind === 'blockers' ? (cands = d.candidates, { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Elvish Mystic', 1], ['Glissa Sunslayer', 1]]).passTo('main2');
    const mystic = tg.bf('Elvish Mystic');
    const glissa = tg.bf('Glissa Sunslayer');
    const de = (nome: string) => cands.find((x) => x.obj === tg.bf(nome))?.canBlock ?? [];
    // a Wall (sem voar nem alcance) só pode bloquear Glissa (3/3); a Spider (alcance) bloqueia as duas
    expect(de('Wall of Omens')).toEqual([glissa]);
    expect(de('Spider').sort()).toEqual([mystic, glissa].sort());
  });
  it('flanqueamento: a bloqueadora sem flanqueamento recebe -1/-1', () => {
    const tg = setup({ battlefield: [[{ name: 'Sidar Kondo of Jamuraa', ready: true }], [{ name: 'Spider', token: true }]], library: [['Island'], ['Island']] });
    tg.script.push((d) => (d.kind === 'blockers' ? { kind: 'blockers', blocks: [[tg.bf('Spider'), tg.bf('Sidar Kondo of Jamuraa')]] } : null));
    tg.attack([['Sidar Kondo of Jamuraa', 1]]).passTo('declareBlockers').resolveAll();
    expect(tg.pt(tg.bf('Spider'))).toEqual([0, 1]);
  });
});
