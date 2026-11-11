import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Tevesh Szat, Doom of Fools";

describe(C, () => {
  it('+2 cria dois Thrulls 0/1', () => {
    const tg = setup({ battlefield: [[C], []] });
    tg.activate(C, '+2').resolve();
    expect(tg.all('Thrull').length).toBe(2);
  });
});
