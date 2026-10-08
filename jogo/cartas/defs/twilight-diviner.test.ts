import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Twilight Diviner', () => {
  it('criatura que volta do cemitério ganha uma cópia, uma vez por turno', () => {
    const tg = setup({
      battlefield: [['Twilight Diviner', ...Array(12).fill('Swamp')], []], hand: [['Aberrant Return', 'Aberrant Return'], []],
      graveyard: [['Wall of Omens', 'Glissa Sunslayer'], []], library: [Array(6).fill('Island'), []],
    });
    tg.choose('alvo', ['Wall of Omens']);
    tg.cast('Aberrant Return').resolveAll();
    expect(tg.all('Wall of Omens').length).toBe(2);
    // segunda vez no mesmo turno: não dispara
    tg.choose('alvo', ['Glissa Sunslayer']);
    tg.cast('Aberrant Return').resolveAll();
    expect(tg.all('Glissa Sunslayer').length).toBe(1);
  });
  it('vindo da mão, não dispara', () => {
    const tg = setup({ battlefield: [['Twilight Diviner', 'Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Elvish Mystic').length).toBe(1);
  });
});
