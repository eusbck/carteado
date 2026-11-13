import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Collective Override';
const FICHAS = 'Crie uma ficha de criatura artefato Borg 1/1 incolor para cada criatura atacando.';
const COMPRAS = 'Compre uma carta para cada criatura atacando.';

describe(N, () => {
  it('sem comandante, escolhe um modo: uma ficha Borg para cada criatura atacando', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Island', 'Island', 'Wall of Omens', 'Steel Overseer'], []], hand: [[N], []] });
    tg.attack([['Steel Overseer', 1]]).passTo('declareBlockers');
    tg.choose('escolha', [FICHAS]).cast(N).resolve();
    expect(tg.all('Borg')).toHaveLength(1);
  });

  it('com um comandante, pode escolher os dois modos', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Island', 'Island', { name: 'Steel Overseer', commander: true }], []], hand: [[N], []] });
    const mao = tg.state.zones.hand[0].length;
    tg.attack([['Steel Overseer', 1]]).passTo('declareBlockers');
    tg.choose('escolha', [FICHAS, COMPRAS]).cast(N).resolve();
    expect(tg.all('Borg')).toHaveLength(1);
    expect(tg.state.zones.hand[0].length).toBe(mao);
  });
});
