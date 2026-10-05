import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Sheltered by Ghosts', () => {
  it('Auras do exilado vão para o cemitério; ele volta como objeto novo quando a Aura sai', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Wall of Omens'], ['Gau, Feral Youth', { name: 'Ethereal Armor', attachTo: 'Gau, Feral Youth' }]],
      hand: [['Sheltered by Ghosts'], []], library: [['Island'], ['Island']],
    });
    tg.choose('criatura que você controla', ['Wall of Omens']).choose('oponente controla', ['Gau, Feral Youth']);
    tg.cast('Sheltered by Ghosts').resolve().resolveAll();
    const w = tg.bf('Wall of Omens');
    expect(tg.names(1, 'exile')).toEqual(['Gau, Feral Youth']);
    expect(tg.names(1, 'graveyard')).toEqual(['Ethereal Armor']);
    expect(tg.pt(w)).toEqual([1, 4]);
    expect(hasKw(tg.g, w, 'lifelink')).toBe(true);
    expect(hasKw(tg.g, w, 'ward')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Sheltered by Ghosts')]));
    tg.resolveAll();
    expect(tg.find('Gau, Feral Youth')).not.toBeNull();
  });
  it('se a Aura já saiu, nada é exilado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Wall of Omens'], ['Gau, Feral Youth']], hand: [['Sheltered by Ghosts'], []], library: [['Island'], ['Island']] });
    tg.choose('criatura que você controla', ['Wall of Omens']).choose('oponente controla', ['Gau, Feral Youth']);
    tg.cast('Sheltered by Ghosts').resolve();
    tg.run(destroy(tg.g, [tg.bf('Sheltered by Ghosts')]));
    tg.resolveAll();
    expect(tg.find('Gau, Feral Youth')).not.toBeNull();
    expect(tg.names(1, 'exile')).toEqual([]);
  });
});
