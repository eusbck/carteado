import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Warren Soultrader";

describe(C, () => {
  it('paga 1 de vida e sacrifica outra criatura por um Treasure', () => {
    const tg = setup({ battlefield: [[C, 'Memnite'], []] });
    tg.activate(C).resolve();
    expect(tg.all('Treasure').length).toBe(1);
    expect(tg.life(0)).toBe(39);
  });
});
