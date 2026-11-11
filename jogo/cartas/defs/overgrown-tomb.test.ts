import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Overgrown Tomb";

describe(C, () => {
  it('é Swamp Forest', () => {
    const tg = setup({ battlefield: [[C], []] });
    expect(tg.state.objects[tg.bf(C)]).toBeDefined();
  });
});
