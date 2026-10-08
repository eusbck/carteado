import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Charcoal Diamond', () => {
  it('entra virado', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Charcoal Diamond'], []] });
    tg.cast('Charcoal Diamond').resolve();
    expect(tg.state.objects[tg.bf('Charcoal Diamond')].tapped).toBe(true);
  });
  it('{T}: adiciona {B}', () => {
    const tg = setup({ battlefield: [['Charcoal Diamond', 'Swamp'], []], hand: [['Undead Augur'], []] });
    tg.cast('Undead Augur').resolve();
    expect(tg.find('Undead Augur')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Charcoal Diamond')].tapped).toBe(true);
  });
});
