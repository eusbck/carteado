import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "The Dross Pits";

describe(C, () => {
  it('sacrifica para comprar', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', 'Swamp'], []], library: [['Opt'], []] });
    tg.activate(C, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toContain('Opt');
    expect(tg.find(C)).toBeNull();
  });
});
