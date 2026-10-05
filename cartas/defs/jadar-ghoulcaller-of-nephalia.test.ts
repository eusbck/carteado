import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Jadar, Ghoulcaller of Nephalia', () => {
  it('cria um Zombie com decaimento só se não houver outro; a ficha não pode bloquear', () => {
    const tg = setup({ step: 'main2', battlefield: [['Jadar, Ghoulcaller of Nephalia'], ['Gau, Feral Youth']], library: [['Island', 'Island'], ['Island']] });
    tg.passTo('end').resolve();
    expect(tg.all('Zombie').length).toBe(1);
    let podia = true;
    tg.script.push((d) => (d.kind === 'blockers' ? (podia = d.candidates.some((x) => x.obj === tg.bf('Zombie') && x.canBlock.length > 0), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Gau, Feral Youth', 0]]);
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main2');
    expect(podia).toBe(false);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'end').resolveAll();
    expect(tg.all('Zombie').length).toBe(1);
  });
});
