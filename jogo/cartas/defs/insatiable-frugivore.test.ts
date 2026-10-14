import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Insatiable Frugivore';
const CEM = ['Island', 'Island', 'Island', 'Plains', 'Plains', 'Plains', 'Forest'];

describe(NOME, () => {
  it('ao entrar cria uma Food; exilando três cartas do cemitério, cria outra, e para quando você não exila', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [CEM, []] });
    tg.choose('Insatiable Frugivore: exilar', ['Island', 'Island', 'Island']);
    tg.choose('Insatiable Frugivore: exilar', []);
    tg.cast(NOME).resolveAll();
    expect(tg.all('Food').length).toBe(2);
    expect(tg.names(0, 'exile')).toEqual(['Island', 'Island', 'Island']);
  });

  it('X = 0 dá só ameaçar; X = 2 sacrifica duas Foods e dá +2/+0', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Food', token: true }, { name: 'Food', token: true }], []] });
    tg.number('X', 0).activate(NOME, '+X/+0').resolve();
    expect(hasKw(tg.g, tg.bf(NOME), 'menace')).toBe(true);
    expect(tg.pt(tg.bf(NOME))).toEqual([2, 4]);
    tg.number('X', 2).choose('Sacrifique', ['Food', 'Food']).activate(NOME, '+X/+0').resolve();
    expect(tg.pt(tg.bf(NOME))).toEqual([4, 4]);
    expect(tg.all('Food')).toEqual([]);
  });
});
