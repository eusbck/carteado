import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Boon Reflection';

describe(N, () => {
  it('você ganha o dobro; o oponente ganha o normal', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(gainLife(tg.g, 0, 3, null)).toBe(6);
    expect(tg.life(0)).toBe(46);
    expect(gainLife(tg.g, 1, 3, null)).toBe(3);
    expect(tg.life(1)).toBe(43);
  });

  it('dois Boon Reflections quadruplicam o ganho', () => {
    const tg = setup({ battlefield: [[N, N], []] });
    gainLife(tg.g, 0, 3, null);
    expect(tg.life(0)).toBe(52);
  });

  it('quando o total de vida "passa a ser" um número maior, a diferença ganha também é dobrada', () => {
    // Invincible Hymn com 50 cartas no grimório e 40 de vida: ganharia 10, ganha 20
    const tg = setup({ battlefield: [[N, ...Array(8).fill('Plains')], []], hand: [['Invincible Hymn'], []], library: [Array(50).fill('Island'), []] });
    tg.cast('Invincible Hymn').resolveAll();
    expect(tg.life(0)).toBe(60);
  });
});