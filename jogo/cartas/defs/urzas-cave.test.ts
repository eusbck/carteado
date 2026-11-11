import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Urza's Cave";

describe(C, () => {
  it('busca um terreno virado', () => {
    const tg = setup({ battlefield: [[C, 'Forest', 'Forest', 'Forest'], []], library: [['Island'], []] });
    tg.choose('terreno', ['Island']).activate(C, 'Procure').resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
