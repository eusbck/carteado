import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Midnight Tilling";

describe(C, () => {
  it('moe quatro e devolve uma de permanente', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[C], []], library: [['Opt', 'Memnite', 'Opt', 'Opt'], []] });
    tg.choose('devolva', ['Memnite']).cast(C).resolve();
    expect(tg.names(0, 'hand')).toContain('Memnite');
  });
});
