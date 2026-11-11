import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Baloth Prime";

describe(C, () => {
  it('sacrificar terreno cria Beast 4/4 virada', () => {
    const tg = setup({ battlefield: [[C, 'Zuran Orb', 'Forest'], []] });
    tg.activate('Zuran Orb').resolveAll();
    expect(tg.pt(tg.all('Beast')[0])).toEqual([4, 4]);
  });
});
