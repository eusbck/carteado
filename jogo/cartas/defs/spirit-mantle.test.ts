import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Spirit Mantle', () => {
  it('+1/+1 e proteção contra criaturas: não pode ser bloqueada por criaturas', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', ready: true }, { name: 'Spirit Mantle', attachTo: 'Elvish Mystic' }], ['Wall of Omens']], library: [['Island'], ['Island']] });
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    let podia = false;
    tg.script.push((d) => (d.kind === 'blockers' ? (podia = d.candidates.some((x) => x.canBlock.length > 0), { kind: 'blockers', blocks: [] }) : null));
    tg.attack([['Elvish Mystic', 1]]).passTo('main2');
    expect(podia).toBe(false);
    expect(tg.life(1)).toBe(38);
  });
});
