import { describe, expect, it } from 'vitest';
import { entraVirado } from '../../testes/padroes.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Abandoned Air Temple';

describe(N, () => {
  it('entra virado sem terreno básico, desvirado com um', () => {
    expect(entraVirado(N, ['Command Tower'])).toBe(true);
    expect(entraVirado(N, ['Plains'])).toBe(false);
  });
  it('{3}{W}, {T}: um marcador +1/+1 em cada criatura sua', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Llanowar Elves', 'Arbor Elf'], ['Elvish Mystic']] });
    tg.activate(N, 'marcador').resolve();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Arbor Elf')].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
