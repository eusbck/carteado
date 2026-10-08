import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Staff of the Storyteller', () => {
  it('a própria ficha de Spirit já dá um marcador; {W}, {T}, remova: compre', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Staff of the Storyteller'], []], library: [['Island'], []] });
    tg.cast('Staff of the Storyteller').resolve().resolveAll();
    const st = tg.bf('Staff of the Storyteller');
    expect(tg.all('Spirit').length).toBe(1);
    expect(tg.state.objects[st].counters.story).toBe(1);
    tg.activate('Staff of the Storyteller').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[st].counters.story ?? 0).toBe(0);
  });
});
