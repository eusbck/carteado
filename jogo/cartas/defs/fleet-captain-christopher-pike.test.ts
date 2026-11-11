import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Fleet Captain Christopher Pike';

describe(N, () => {
  it('No: vira duas outras criaturas alvo; Yes: desvira duas outras criaturas alvo', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Elvish Mystic'], ['Wall of Omens', 'Indomitable Ancients']] });
    tg.choose('virar', ['Wall of Omens', 'Indomitable Ancients']);
    tg.activate(N, 'Vire duas').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);

    const yes = setup({ battlefield: [[N, 'Island', { name: 'Elvish Mystic', tapped: true }, { name: 'Indomitable Ancients', tapped: true }], []] });
    yes.choose('desvirar', ['Elvish Mystic', 'Indomitable Ancients']);
    yes.activate(N, 'Desvire duas').resolve();
    expect(yes.state.objects[yes.bf('Elvish Mystic')].tapped).toBe(false);
    expect(yes.state.objects[yes.bf('Indomitable Ancients')].tapped).toBe(false);
  });
});
