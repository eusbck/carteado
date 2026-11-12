import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Vito, Thorn of the Dusk Rose';

describe(NOME, () => {
  it('perder vida não é dano: o vínculo com a vida de Vito não ganha vida de novo', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []] });
    tg.activate(NOME, '{3}{B}{B}').resolve();
    gainLife(tg.g, 0, 3, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
  });

  it('duas criaturas com vínculo com a vida causando dano de combate disparam duas vezes', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[NOME, 'Wall of Omens', 'Indomitable Ancients', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []] });
    tg.activate(NOME, '{3}{B}{B}').resolve();
    tg.attack([[NOME, 1], ['Indomitable Ancients', 1]]).passTo('combatDamage');
    tg.resolveAll();
    // 1 + 2 de dano de combate; depois a perda de vida pelos dois ganhos (1 e 2)
    expect(tg.life(1)).toBe(40 - 3 - 3);
    expect(tg.life(0)).toBe(43);
  });
});
