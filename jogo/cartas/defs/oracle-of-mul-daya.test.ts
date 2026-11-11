import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Oracle of Mul Daya";

describe(C, () => {
  it('joga terreno do topo', () => {
    const tg = setup({ battlefield: [[C], []], library: [['Forest', 'Opt'], []] });
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
  });
});
