import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Resplendent Angel';

describe(N, () => {
  it('tendo ganhado 5 ou mais de vida no turno, em mais de uma vez, cria um Angel 4/4 com voar e vigilância', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    gainLife(tg.g, 0, 3, null);
    gainLife(tg.g, 0, 4, null);
    tg.refresh();
    tg.passTo('upkeep', 1);
    const fichas = tg.all('Angel');
    expect(fichas).toHaveLength(1);
    expect(tg.pt(fichas[0])).toEqual([4, 4]);
    expect(hasKw(tg.g, fichas[0], 'flying')).toBe(true);
    expect(hasKw(tg.g, fichas[0], 'vigilance')).toBe(true);
  });

  it('com menos de 5 de vida ganha no turno, a habilidade não dispara', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 4, null);
    tg.refresh();
    tg.passTo('upkeep', 1);
    expect(tg.find('Angel')).toBeNull();
  });

  it('{3}{W}{W}{W}: +2/+2 e vínculo com a vida até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, ...Array(6).fill('Plains')], []] });
    tg.activate(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'lifelink')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
  });
});