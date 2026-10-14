import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Feather, Radiant Arbiter';

describe(NOME, () => {
  it('Aura conjurada em Feather: paga {2} e a cópia vira uma ficha da Aura presa à outra criatura', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Indomitable Ancients']], hand: [['Ethereal Armor'], []] });
    tg.choose('criatura', [NOME]);
    tg.choose('Feather: escolha', ['Wall of Omens']);
    tg.cast('Ethereal Armor').resolveAll();
    const auras = tg.all('Ethereal Armor');
    expect(auras.length).toBe(2);
    const presas = auras.map((id) => tg.state.objects[id].attachedTo).sort();
    expect(presas).toEqual([tg.bf(NOME), tg.bf('Wall of Omens')].sort());
    expect(auras.filter((id) => tg.state.objects[id].isToken).length).toBe(1);
  });

  it('não dispara para mágica que mira outra criatura', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Ethereal Armor'], []] });
    tg.choose('criatura', ['Wall of Omens']);
    tg.cast('Ethereal Armor').resolveAll();
    expect(tg.all('Ethereal Armor').length).toBe(1);
  });
});
