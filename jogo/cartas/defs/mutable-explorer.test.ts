import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Mutable Explorer', () => {
  it('cria uma ficha Mutavault virada, com as habilidades do Mutavault', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [['Mutable Explorer'], []] });
    tg.cast('Mutable Explorer').resolve();
    tg.resolveAll();
    const id = tg.bf('Mutavault');
    expect(tg.state.objects[id].isToken).toBe(true);
    expect(tg.state.objects[id].tapped).toBe(true);
  });
});
