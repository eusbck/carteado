import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Teacher's Pest", () => {
  it('ganha 1 de vida ao atacar', () => {
    const tg = setup({ battlefield: [[{ name: "Teacher's Pest", ready: true }], []], library: [['Island'], ['Island']] });
    tg.attack([["Teacher's Pest", 1]]).passTo('main2');
    expect(tg.life(0)).toBe(41);
    expect(tg.life(1)).toBe(39);
  });
  it('{B}{G}: volta do cemitério ao campo virada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], []], graveyard: [["Teacher's Pest"], []] });
    tg.activate("Teacher's Pest").resolve();
    expect(tg.state.objects[tg.bf("Teacher's Pest")].tapped).toBe(true);
  });
});
