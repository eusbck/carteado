import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Worldsoul's Rage";

describe(C, () => {
  it('X de dano e até X terrenos', () => {
    const tg = setup({ battlefield: [[...Array(2).fill('Mountain'), 'Forest', 'Forest'], []], hand: [[C, 'Island'], []] });
    tg.lenient = true;
    tg.number('X', 2).choose('qualquer alvo', ['Bruno']).choose('Coloque até', ['Island (mão)']).cast(C).resolve();
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.life(1)).toBe(38);
  });
});
