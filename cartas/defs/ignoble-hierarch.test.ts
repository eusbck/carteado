import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ignoble Hierarch', () => {
  it('exaltado: a criatura que ataca sozinha recebe +1/+1', () => {
    const tg = setup({ battlefield: [['Ignoble Hierarch', 'Ignoble Hierarch', 'Gau, Feral Youth'], []], library: [['Island'], ['Island']] });
    tg.attack([['Gau, Feral Youth', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(35); // 2 + 1 (fúria) + 2 (dois exaltados)
  });
  it('atacando com duas, não dispara', () => {
    const tg = setup({ battlefield: [['Ignoble Hierarch', 'Gau, Feral Youth', 'Glissa Sunslayer'], []], library: [['Island'], ['Island']] });
    tg.choose('escolha 1 modo', ['Você compra uma carta e perde 1 de vida']);
    tg.attack([['Gau, Feral Youth', 1], ['Glissa Sunslayer', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(34); // 3 (Gau com fúria) + 3 (Glissa)
  });
});
