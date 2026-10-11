import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Gwyllion Hedge-Mage';

describe(N, () => {
  it('com duas Plains e dois Swamps, cria o Kithkin Soldier e põe um marcador -1/-1 na criatura alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.yes('Kithkin Soldier', true).yes('marcador -1/-1', true);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    const ficha = tg.bf('Kithkin Soldier');
    expect(tg.pt(ficha)).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([1, 9]);
  });

  it('sem dois terrenos do tipo, a habilidade não dispara', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('marcador -1/-1')) throw new Error('não devia disparar'); return null; });
    tg.yes('Kithkin Soldier', false);
    tg.cast(N).resolveAll();
    expect(tg.find('Kithkin Soldier')).toBeNull();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });
});