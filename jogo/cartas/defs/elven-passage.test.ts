import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Elven Passage";

describe(C, () => {
  it('busca básico virado', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Forest'], []] });
    tg.lenient = true;
    tg.choose('básico', ['Forest']).activate(C).resolveAll();
    expect(tg.find('Forest')).not.toBeNull();
  });
});
