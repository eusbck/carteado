import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Crowded Crypt";

describe(C, () => {
  it('ganha cadáver quando sua criatura morre e cria Zombies por cadáver', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { corpse: 2 } }, ...Array(6).fill('Swamp')], []] });
    tg.activate(C, 'Crie').resolve();
    expect(tg.all('Zombie').length).toBe(2);
  });
});
