import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Reassembling Skeleton";

describe(C, () => {
  it('volta do cemitério virado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], graveyard: [[C], []] });
    tg.activate(C).resolve();
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
  });
});
