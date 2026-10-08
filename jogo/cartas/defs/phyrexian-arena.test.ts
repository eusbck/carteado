import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Phyrexian Arena', () => {
  it('CR 603.2b: no início da sua manutenção, compra uma carta e perde 1 de vida; não na do oponente', () => {
    const tg = setup({ active: 1, step: 'end', battlefield: [['Phyrexian Arena'], []], library: [['Island', 'Forest', 'Plains'], ['Mountain', 'Mountain']] });
    tg.passTo('upkeep', 0); // para depois de o gatilho resolver, ainda antes da compra normal
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(39);
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Forest']); // só a compra da etapa de compra
    expect(tg.life(0)).toBe(39);
  });
});
