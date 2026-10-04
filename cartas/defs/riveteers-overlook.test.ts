import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Riveteers Overlook', () => {
  it('se sacrifica e, quando faz isso, busca Swamp/Mountain/Forest básica virada e ganha 1 de vida', () => {
    const tg = setup({ hand: [['Riveteers Overlook'], []], library: [['Plains', 'Mountain'], []] });
    tg.choose('Swamp, Mountain ou Forest', ['Mountain']).play('Riveteers Overlook').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Riveteers Overlook']);
    expect(tg.state.zones.stack.length).toBe(1); // gatilho reflexivo
    tg.resolve();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
    expect(tg.life(0)).toBe(41);
  });
});
