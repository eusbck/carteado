import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Icetill Explorer";

describe(C, () => {
  it('joga terreno do cemitério e moe na queda de terreno', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Forest'], []], library: [['Opt'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.names(0, 'graveyard')).toContain('Opt');
  });
});
