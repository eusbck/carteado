import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Reprocess";

describe(C, () => {
  it('sacrifica e compra uma por cada', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Memnite', 'Sol Ring'], []], hand: [[C], []], library: [['Opt', 'Opt'], []] });
    tg.choose('Reprocess', ['Memnite', 'Sol Ring']).cast(C).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Opt']);
  });
});
