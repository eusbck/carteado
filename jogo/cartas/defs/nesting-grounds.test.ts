import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Nesting Grounds', () => {
  it('escolhe o tipo de marcador na resolução', () => {
    const tg = setup({ battlefield: [['Nesting Grounds', 'Plains', { name: 'Wall of Omens', counters: { '+1/+1': 1, oil: 2 } }], ['Elvish Mystic']] });
    tg.choose('de onde sai', ['Wall of Omens']).choose('para onde vai', ['Elvish Mystic']).choose('tipo de marcador', ['oil']);
    tg.activate('Nesting Grounds', 'Mova').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters).toEqual({ '+1/+1': 1, oil: 1 });
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters).toEqual({ oil: 1 });
  });
});
