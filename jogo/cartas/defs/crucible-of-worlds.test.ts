import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Crucible of Worlds";

describe(C, () => {
  it('joga terreno do cemitério', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Forest'], []] });
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
  });
});
