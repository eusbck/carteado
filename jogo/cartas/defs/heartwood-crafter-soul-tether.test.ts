import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Heartwood Crafter // Soul Tether';

describe(N, () => {
  it('entra preparado; Soul Tether, conjurada do exílio, cria um Heartwood', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.cast('Heartwood Crafter').resolve();
    const h = tg.bf('Heartwood Crafter');
    expect(tg.state.objects[h].prepared).toBe(true);
    tg.cast('Soul Tether', 'prepared').resolve();
    expect(tg.all('Heartwood').length).toBe(1);
    expect(tg.state.objects[h].prepared).toBeFalsy();
  });
  it('a mana {C} não paga mágicas da mão', () => {
    const tg = setup({ battlefield: [[{ name: N }, 'Forest', 'Forest'], []], hand: [['Sol Ring'], []] });
    // Sol Ring custa {1}: só a mana do Crafter não paga (Forests viradas)
    for (const id of tg.state.zones.battlefield) if (tg.state.objects[id].def === 'Forest') tg.state.objects[id].tapped = true;
    tg.refresh();
    expect(tg.canCast('Sol Ring')).toBe(false);
  });
});
