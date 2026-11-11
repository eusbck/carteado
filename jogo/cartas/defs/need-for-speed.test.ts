import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Need for Speed";

describe(C, () => {
  it('sacrifica terreno: ímpeto', () => {
    const tg = setup({ battlefield: [[C, 'Forest', 'Memnite'], []] });
    tg.choose('criatura alvo', ['Memnite']).activate(C).resolve();
    expect(hasKw(tg.g, tg.bf('Memnite'), 'haste')).toBe(true);
  });
});
