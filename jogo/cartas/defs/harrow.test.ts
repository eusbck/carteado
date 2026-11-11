import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Harrow";

describe(C, () => {
  it('sacrifica um terreno e põe dois básicos desvirados', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Swamp'], []], hand: [[C], []], library: [['Island', 'Mountain', 'Opt'], []] });
    tg.choose('um terreno', ['Swamp']).choose('básico', ['Island', 'Mountain']).cast(C).resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
    expect(tg.find('Mountain')).not.toBeNull();
  });
});
