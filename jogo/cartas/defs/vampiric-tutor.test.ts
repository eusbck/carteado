import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Vampiric Tutor";

describe(C, () => {
  it('põe a carta no topo e perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[C], []], library: [['Opt', 'Sol Ring', 'Forest'], []] });
    tg.choose('topo', ['Sol Ring']).cast(C).resolve();
    expect(tg.state.objects[tg.state.zones.library[0][0]].def).toBe('Sol Ring');
    expect(tg.life(0)).toBe(38);
  });
});
