import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Temporal Tribulation';

describe(N, () => {
  it('exila duas permanentes suas, que voltam no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Sol Ring', 'Wall of Omens'], []], hand: [[N], []], library: [['Forest', 'Forest'], []] });
    tg.choose('duas permanentes', ['Sol Ring', 'Wall of Omens']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Sol Ring', 'battlefield')).not.toBeNull();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
  });
});
