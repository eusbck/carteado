import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Scapeshift";

describe(C, () => {
  it('sacrifica terrenos e busca a mesma quantidade virados', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Forest')], []], hand: [[C], []], library: [['Island', 'Swamp'], []] });
    tg.choose('sacrifique quantos', ['Forest', 'Forest']).choose('terreno', ['Island', 'Swamp']).cast(C).resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.all('Forest').length).toBe(2);
  });
});
