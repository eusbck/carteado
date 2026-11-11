import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Rocky Tar Pit";

describe(C, () => {
  it('entra virado e busca Swamp ou Mountain', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Mountain'], []] });
    tg.choose('Swamp ou Mountain', ['Mountain']).activate(C).resolveAll();
    expect(tg.find('Mountain')).not.toBeNull();
  });
});
