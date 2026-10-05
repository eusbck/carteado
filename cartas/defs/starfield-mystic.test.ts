import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Starfield Mystic', () => {
  it('mágicas de encantamento custam {1} a menos', () => {
    const tg = setup({ battlefield: [['Starfield Mystic', 'Plains', 'Plains', 'Plains'], []], hand: [["Sage's Reverie"], []] });
    expect(tg.canCast("Sage's Reverie")).toBe(true); // {3}{W} por {2}{W}
    const sem = setup({ battlefield: [['Wall of Omens', 'Plains', 'Plains', 'Plains'], []], hand: [["Sage's Reverie"], []] });
    expect(sem.canCast("Sage's Reverie")).toBe(false);
  });
  it('Aura sua na criatura de um oponente conta quando vai ao cemitério', () => {
    const tg = setup({ battlefield: [['Starfield Mystic', 'Plains'], ['Elvish Mystic']], hand: [['Spirit Mantle'], []], library: [['Island'], []] });
    tg.choose('criatura', ['Elvish Mystic']);
    tg.cast('Spirit Mantle').resolve();
    expect(tg.state.objects[tg.bf('Spirit Mantle')].attachedTo).toBe(tg.bf('Elvish Mystic'));
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Starfield Mystic'))).toEqual([3, 3]);
  });
});
