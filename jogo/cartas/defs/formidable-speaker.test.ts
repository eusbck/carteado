import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Formidable Speaker";

describe(C, () => {
  it('desvira outro permanente', () => {
    const tg = setup({ battlefield: [[C, 'Forest', { name: 'Sol Ring', tapped: true }], []] });
    tg.choose('outro permanente', ['Sol Ring']).activate(C).resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
  });
});
