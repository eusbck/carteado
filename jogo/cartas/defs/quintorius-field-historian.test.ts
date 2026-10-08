import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Quintorius, Field Historian', () => {
  it('várias cartas de uma vez criam uma ficha só; Spirits recebem +1/+0', () => {
    const tg = setup({ battlefield: [['Quintorius, Field Historian'], []], graveyard: [['Island', 'Swamp'], []] });
    tg.run(exile(tg.g, [...tg.state.zones.graveyard[0]]));
    tg.resolveAll();
    expect(tg.all('Spirit').length).toBe(1);
    expect(tg.pt(tg.bf('Spirit'))).toEqual([4, 2]);
  });
});
