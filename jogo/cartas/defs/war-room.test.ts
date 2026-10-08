import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('War Room', () => {
  it('paga pela identidade de cor do comandante', () => {
    const tg = setup({
      battlefield: [['War Room', 'Plains', 'Plains', 'Plains'], []], command: [[{ name: 'Mangara, the Diplomat', commander: true }], []], library: [['Island'], []],
    });
    tg.activate('War Room', 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(39); // Mangara é mono-branca
  });
  it('sem comandante, não pode ativar', () => {
    const tg = setup({ battlefield: [['War Room', 'Plains', 'Plains', 'Plains'], []], library: [['Island'], []] });
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('War Room')}:`))).toBe(false);
  });
});
