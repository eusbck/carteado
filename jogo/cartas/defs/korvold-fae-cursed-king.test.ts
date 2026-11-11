import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Korvold, Fae-Cursed King";

describe(C, () => {
  it('ao entrar sacrifica outro permanente, ganha marcador e compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Forest', 'Memnite'], []], hand: [[C], []], library: [['Opt'], []] });
    tg.choose('outro permanente', ['Memnite']).cast(C).resolve().resolveAll();
    expect(tg.state.objects[tg.bf(C)].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});
