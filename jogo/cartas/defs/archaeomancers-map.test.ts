import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Archaeomancer's Map", () => {
  it('ao entrar, busca até duas Plains básicas para a mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [["Archaeomancer's Map"], []], library: [['Plains', 'Island', 'Plains', 'Plains'], []] });
    tg.choose('Plains básica', ['Plains', 'Plains']).cast("Archaeomancer's Map").resolve().resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains']);
  });
  it('CR 603.4: só dispara se o oponente fica com mais terrenos que você', () => {
    const tg = setup({ active: 1, battlefield: [["Archaeomancer's Map", 'Plains', 'Plains'], ['Forest', 'Forest']], hand: [['Island'], ['Forest', 'Forest']] });
    tg.choose('Map: você pode colocar', ['Island']);
    tg.play('Forest'); // 3 contra 2
    tg.resolve();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Island')).toEqual(['Island']);
    const tg2 = setup({ active: 1, battlefield: [["Archaeomancer's Map", 'Plains', 'Plains'], ['Forest']], hand: [['Island'], ['Forest']] });
    tg2.play('Forest'); // 2 contra 2
    expect(tg2.state.zones.stack.length).toBe(0);
  });
});
