import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mountain Valley";

describe(C, () => {
  it('busca Mountain ou Forest', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Forest'], []] });
    tg.choose('Mountain ou Forest', ['Forest']).activate(C).resolveAll();
    expect(tg.find('Forest')).not.toBeNull();
  });
});
